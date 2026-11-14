import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';
import { OtelLogsService } from './opentelemetry/otel-logs.service.js';
import { TracerService } from './opentelemetry/tracing/tracer.service.js';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService,OtelLogsService,TracerService],
  exports: [MetricsService,OtelLogsService,TracerService],
})
export class MonitoringModule {}