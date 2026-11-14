import {
  Injectable,
} from '@nestjs/common';

import {
  Span,
  SpanStatusCode,
  trace,
  Attributes,
} from '@opentelemetry/api';

@Injectable()
export class TracerService {
  private readonly tracer = trace.getTracer('nest-blog-api-2');

  async startActiveSpan<T>(
    name: string,
    callback: (span: Span) => Promise<T>,
    attributes?: Attributes,
  ): Promise<T> {
    return this.tracer.startActiveSpan(
      name,
      { attributes },
      async (span) => {
        try {
          const result = await callback(span);

          span.setStatus({
            code: SpanStatusCode.OK,
          });

          return result;
        } catch (error) {
          span.recordException(
            error instanceof Error ? error : new Error(String(error)),
          );

          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}