
import type { LoggerService } from '@nestjs/common';
import { SeverityNumber } from '@opentelemetry/api-logs';
import type { OtelLogsService } from './otel-logs.service.js';

export class OpenTelemetryLogger implements LoggerService {
  private readonly otelLogger;

  constructor(
    private readonly consoleLogger: LoggerService,
    otelLogsService: OtelLogsService,
  ) {
    this.otelLogger = otelLogsService.getLogger('nestjs');
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.log(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.INFO, 'INFO');
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.error(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.ERROR, 'ERROR');
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.warn(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.WARN, 'WARN');
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.debug?.(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.DEBUG, 'DEBUG');
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.verbose?.(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.TRACE, 'TRACE');
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.consoleLogger.fatal?.(message, ...optionalParams);

    this.emitLog(message, optionalParams, SeverityNumber.FATAL, 'FATAL');
  }

  private emitLog(
    message: unknown,
    optionalParams: unknown[],
    severityNumber: SeverityNumber,
    severityText: string,
  ): void {
    const body = this.formatMessage(message);

    this.otelLogger.emit({
      body,
      severityNumber,
      severityText,
      attributes: {
        'service.logger': 'nestjs',
        'log.optional_params': this.safeStringify(optionalParams),
      },
    });
  }

  private formatMessage(message: unknown): string {
    if (message instanceof Error) {
      return message.message;
    }

    if (typeof message === 'string') {
      return message;
    }

    return this.safeStringify(message);
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
}
