
import { Global, Module } from '@nestjs/common';
import { RedisCacheAdapter } from './redis/redis-cache.adapter.js';
import { CACHE_PROVIDER } from '../../core/chaching/cache.types.js';

@Global()
@Module({
  providers: [
    RedisCacheAdapter,
    {
      provide: CACHE_PROVIDER,
      useExisting: RedisCacheAdapter,
    },
  ],
  exports: [CACHE_PROVIDER,RedisCacheAdapter],
})
export class CachingModule {}
