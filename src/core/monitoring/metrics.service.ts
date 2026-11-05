
import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from '@prometheus-io/client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

readonly httpRequestsTotal: Counter<
  'method' | 'route' | 'status_code'
>;

readonly httpRequestDuration: Histogram<
  'method' | 'route'
>;

readonly httpRequestsInProgress: Gauge<'method'>;


  constructor() {
    this.registry = new Registry();

    collectDefaultMetrics({
      register: this.registry,
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']as const,
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route']as const,
      registers: [this.registry],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method']as const,
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
