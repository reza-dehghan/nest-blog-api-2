import { AsyncLocalStorage } from 'node:async_hooks';
import { Module } from '@nestjs/common';

import type { RequestContextStore } from './request-context.types.js';
import { RequestContextService } from './request-context.service.js';

@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage<RequestContextStore>(),
    },
    RequestContextService
  ],
  exports: [
    AsyncLocalStorage,
    RequestContextService

  ],
})
export class RequestContextModule {}