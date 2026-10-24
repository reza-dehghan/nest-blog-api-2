
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

  /**
   * get a value from the cache by its key
   * 
   * @param key The key of the value
   * @returns the cached value , or null if it dose not wxist.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get<T>(key);
    return value === undefined ? null : value;
  }


  /**
   * save a value in the cache
   * 
   * @param key 
   * @param value 
   * @param ttlMilliseconds the optional expiration time in millisecond
   */
  async set<T>(
    key: string,
    value: T,
    ttlMilliseconds?: number,
  ): Promise<void> {
    await this.cache.set(key, value, ttlMilliseconds);
  }

  /**
   * delete a value from the cache by its key.
   * 
   * @param key 
   */

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
