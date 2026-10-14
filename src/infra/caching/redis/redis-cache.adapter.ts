
import { Injectable } from '@nestjs/common';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { CacheProvider } from '../../../core/chaching/cache.types.js';

@Injectable()
export class RedisCacheAdapter implements CacheProvider {
  private readonly cache: Keyv;

  constructor() {
    this.cache = new Keyv({
      store: new KeyvRedis('redis://localhost:63379'),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get<T>(key);
    return value === undefined ? null : value;
  }

  async set<T>(
    key: string,
    value: T,
    ttlMilliseconds?: number,
  ): Promise<void> {
    await this.cache.set(key, value, ttlMilliseconds);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
