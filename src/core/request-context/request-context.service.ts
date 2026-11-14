import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestContextStore } from './request-context.types.js';  

@Injectable()
export class RequestContextService{
    constructor(
        private readonly asyncLocalStorage:AsyncLocalStorage<RequestContextStore>,
    ){}

    getRequestId(): string | undefined{
        return this.asyncLocalStorage.getStore()?.requestId;
    }
}