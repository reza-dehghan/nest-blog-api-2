import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
