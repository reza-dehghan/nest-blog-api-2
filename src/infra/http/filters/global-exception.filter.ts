
import {
  ArgumentsHost,
  Catch,
  HttpException,
  Inject,
  Logger,
} from '@nestjs/common';

import {
  BaseExceptionFilter,
  HttpAdapterHost,
} from '@nestjs/core';
import { RequestContextService } from '../../../core/request-context/request-context.service.js';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(
    GlobalExceptionFilter.name,
  );

  constructor(
    @Inject(HttpAdapterHost)
    httpAdapterHost: HttpAdapterHost,
    private readonly requestContext:RequestContextService
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  override catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
     const isServerError =
        exception instanceof HttpException
      ? exception.getStatus() >= 500
      : true;

  if (isServerError) {
    const error =
      exception instanceof Error
        ? exception
        : new Error(String(exception));

    this.logger.error('Unhandled exception', {
      requestId: this.requestContext.getRequestId(),
      exceptionName: error.name,
      message: error.message,
      stack: error.stack,
    });
    }

    super.catch(exception, host);
  }
}
