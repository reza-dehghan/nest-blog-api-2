import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

import {
  ConsoleLogger,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContextStore } from './core/request-context/request-context.types.js';
import { MetricsService } from './core/monitoring/metrics.service.js';
import { OtelLogsService } from './core/monitoring/opentelemetry/otel-logs.service.js';
import { OpenTelemetryLogger } from './core/monitoring/opentelemetry/opentelemetry-logger.js';

function configureSwagger(
  app: INestApplication,
  packageName: string,
  packageVersion: string,
  packageDescription: string,
) {
  const config = new DocumentBuilder()
    .setTitle(`${packageName} API`)
    .setDescription(packageDescription)
    .setVersion(packageVersion)
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Local')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);
}

function configureLogger(packageName: string, version: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const logger = new ConsoleLogger({
    json: !isDevelopment,
    prefix: `${packageName} ${version}`,

    logLevels: isDevelopment
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'],
  });

  logger.log(
    'logger configured',
    {
      servise: packageName,
      version,
    },
    'Bootstrap',
  );

  Logger.overrideLogger(logger);

  return logger;
}

async function bootstrap() {
  const PACKAGE_NAME = process.env.npm_package_name || 'nest-blog-api';

  const PACKAGE_VERSION = process.env.npm_package_version || '0.0.0';

  const PACKAGE_DESCRIPTION = process.env.npm_package_description || '';

  const logger = configureLogger(PACKAGE_NAME, PACKAGE_VERSION);

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.use(cookieParser());

  const otelLogsService = app.get(OtelLogsService);

  app.useLogger(new OpenTelemetryLogger(logger, otelLogsService));

  const metricsService = app.get(MetricsService);

  const requestContext =
    app.get<AsyncLocalStorage<RequestContextStore>>(AsyncLocalStorage);

  const httpLogger = new Logger('HTTP');

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Exclude the metrics endpoint from HTTP instrumentation.
    if (req.path === '/metrics') {
      return next();
    }

    const requestId = randomUUID();
    const startedAt = Date.now();

    metricsService.httpRequestsInProgress.inc({
      method: req.method,
    });

    requestContext.run({ requestId }, () => {
      let gaugeReleased = false;

      const releaseGauge = () => {
        if (gaugeReleased) return;

        gaugeReleased = true;

        metricsService.httpRequestsInProgress.dec({
          method: req.method,
        });
      };

      res.once('finish', () => {
 
        releaseGauge();

        const durationSeconds = (Date.now() - startedAt) / 1000;

        const route = req.route?.path
          ? `${req.baseUrl}${req.route.path}`
          : 'unmatched';

        metricsService.httpRequestsTotal.inc({
          method: req.method,
          route,
          status_code: String(res.statusCode),
        });

        metricsService.httpRequestDuration.observe(
          {
            method: req.method,
            route,
          },
          durationSeconds,
        );

        httpLogger.log('HTTP request completed', {
          requestId,
          method: req.method,
          url: req.path,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });

      res.once('close', () => {
        if (!res.writableFinished) {
          releaseGauge();
        }
      });

      next();
    });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : false,
    credentials: true,
  });

  configureSwagger(app, PACKAGE_NAME, PACKAGE_VERSION, PACKAGE_DESCRIPTION);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
