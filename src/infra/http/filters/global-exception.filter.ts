
import {
  ArgumentsHost,
  Catch,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  BaseExceptionFilter,
  HttpAdapterHost,
} from '@nestjs/core';

import { RequestContextService } from '../../../core/request-context/request-context.service.js';

@Catch()
@Injectable()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(
    GlobalExceptionFilter.name,
  );

  private readonly adapterHost: HttpAdapterHost;

  constructor(
    @Inject(HttpAdapterHost)
    httpAdapterHost: HttpAdapterHost,
    private readonly requestContext: RequestContextService,
  ) {
    super(httpAdapterHost.httpAdapter);
    this.adapterHost = httpAdapterHost;
  }

  override catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const isHttpException =
      exception instanceof HttpException;

    const isServerError = isHttpException
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

    // Preserve Nest's default handling for HttpException.
    if (isHttpException) {
      super.catch(exception, host);
      return;
    }

    // Handle unknown exceptions without duplicate logging.
    const httpAdapter = this.adapterHost.httpAdapter;
    const response = host.switchToHttp().getResponse();

    const responseBody = {
      statusCode: 500,
      message: 'Internal server error',
    };

    if (!httpAdapter.isHeadersSent(response)) {
      httpAdapter.reply(response, responseBody, 500);
    } else {
      httpAdapter.end(response);
    }
  }
}
