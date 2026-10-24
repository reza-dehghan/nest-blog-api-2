
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

const startupStartedAt = performance.now();

function logStartup(message: string): void {
  const elapsed = (
    performance.now() - startupStartedAt
  ) / 1000;

  console.log(
    `[STARTUP +${elapsed.toFixed(3)}s] ${message}`,
  );
}

async function bootstrap() {
  logStartup('bootstrap started');

  const app = await NestFactory.create(AppModule);
  logStartup('NestFactory.create completed');

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });
  logStartup('request middleware registered');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  logStartup('global validation pipe registered');

  await app.listen(process.env.PORT ?? 3000);
  logStartup('app.listen completed');
}

bootstrap().catch((error: unknown) => {
  logStartup('bootstrap failed');
  console.error(error);
  process.exitCode = 1;
});





































// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module.js';
// import { ValidationPipe } from '@nestjs/common';
// import type { Request, Response, NextFunction } from 'express';
// import cookieParser from 'cookie-parser'

// async function bootstrap() {

//   const app = await NestFactory.create(AppModule);

//  app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log('Incoming request:', req.method, req.url);
//   next();
// });

//    app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );

//   await app.listen(process.env.PORT ?? 3000);


// }
// await bootstrap();
