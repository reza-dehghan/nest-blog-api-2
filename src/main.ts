
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module.js';
// import { ValidationPipe } from '@nestjs/common';
// import type { Request, Response, NextFunction } from 'express';
// import cookieParser from 'cookie-parser';

// const startupStartedAt = performance.now();

// function logStartup(message: string): void {
//   const elapsed = (
//     performance.now() - startupStartedAt
//   ) / 1000;

//   console.log(
//     `[STARTUP +${elapsed.toFixed(3)}s] ${message}`,
//   );
// }

// async function bootstrap() {
//   logStartup('bootstrap started');

//   const app = await NestFactory.create(AppModule);
//   logStartup('NestFactory.create completed');

//   app.use((req: Request, res: Response, next: NextFunction) => {
//     console.log('Incoming request:', req.method, req.url);
//     next();
//   });
//   logStartup('request middleware registered');

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );
//   logStartup('global validation pipe registered');

//   await app.listen(process.env.PORT ?? 3000);
//   logStartup('app.listen completed');
// }

// bootstrap().catch((error: unknown) => {
//   logStartup('bootstrap failed');
//   console.error(error);
//   process.exitCode = 1;
// });





































import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
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
    .addServer('http://localhost:3000', 'Local')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);
}

function configureLogger(
  packageName: string,
  version: string,
) {

  const isDevelopment = process.env.NODE_ENV === 'development';


  const logger = new ConsoleLogger({
    json:!isDevelopment,
    prefix: `${packageName} ${version}`,

    logLevels: isDevelopment
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'],
    
  });

    logger.log(
      'logger configured',
      {
        servise:packageName,
        version
      },
      'Bootstrap',
    )

  Logger.overrideLogger(logger);

  return logger;
}

async function bootstrap() {
  const PACKAGE_NAME =
    process.env.npm_package_name || 'nest-blog-api';

  const PACKAGE_VERSION =
    process.env.npm_package_version || '0.0.0';

  const PACKAGE_DESCRIPTION =
    process.env.npm_package_description || '';

  const logger = configureLogger(
    PACKAGE_NAME,
    PACKAGE_VERSION,
  );

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const requestContext = app.get<
  AsyncLocalStorage<RequestContextStore>
  >(AsyncLocalStorage);

  const httpLogger = new Logger('HTTP');

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  requestContext.run({ requestId }, () => {


    res.once('finish', () => {
      httpLogger.log('HTTP request completed', {
        requestId,
        method: req.method,
        url: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
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

  app.enableCors();

  configureSwagger(
    app,
    PACKAGE_NAME,
    PACKAGE_VERSION,
    PACKAGE_DESCRIPTION,
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();