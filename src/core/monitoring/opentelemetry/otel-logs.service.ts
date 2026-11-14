import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';

@Injectable()
export class OtelLogsService implements OnModuleDestroy {
  private readonly loggerProvider: LoggerProvider;

  constructor() {
    
    const resource = resourceFromAttributes({
      'service.name': process.env.npm_package_name || 'nest-blog-api-2',
    });

    const exporter = new OTLPLogExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
        'http://localhost:4318/v1/logs',
    });

    this.loggerProvider = new LoggerProvider({
      resource,
      processors: [
        new BatchLogRecordProcessor({
          exporter,
        }),
      ],
    });
  }

  getLogger(name: string) {
    return this.loggerProvider.getLogger(name);
  }

  async onModuleDestroy(): Promise<void> {
    await this.loggerProvider.shutdown();
  }
}
