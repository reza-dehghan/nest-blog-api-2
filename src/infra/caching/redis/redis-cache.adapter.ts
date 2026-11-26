import { Injectable, OnModuleInit } from '@nestjs/common';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

import { CacheProvider } from '../../../core/chaching/cache.types.js';

@Injectable()
export class RedisCacheAdapter implements CacheProvider, OnModuleInit {
  private readonly cache: Keyv;
  private readonly redisStore: KeyvRedis<unknown>;

  constructor() {
    this.redisStore = new KeyvRedis('redis://localhost:63379');

    this.cache = new Keyv({
      store: this.redisStore,
    });
  }

  /**
   * Get the underlying Redis client.
   */
  getRedisClient() {
    return this.redisStore.client;
  }

  /**
   * Check whether the Redis connection is ready.
   */
  isReady(): boolean {
    const client = this.redisStore.client;

    return 'isReady' in client && client.isReady === true;
  }

  /**
   * Get a value from the cache by its key.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get<T>(key);

    return value === undefined ? null : value;
  }

  /**
   * Save a value in the cache.
   */
  async set<T>(
    key: string,
    value: T,
    ttlMilliseconds?: number,
  ): Promise<void> {
    await this.cache.set(key, value, ttlMilliseconds);
  }

  /**
   * Delete a value from the cache by its key.
   */
  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }


  
  async onModuleInit(): Promise<void> {
    const client = this.redisStore.client;

    if ('isOpen' in client && !client.isOpen) {
      await client.connect();
    }
  }
}