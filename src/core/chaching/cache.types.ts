
/** Provides generic key-value caching operations. */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;

  set<T>(key: string, value: T, ttlMilliseconds?: number): Promise<void>;

  delete(key: string): Promise<void>;
}

/** Key for injecting the cache provider. */
export const CACHE_PROVIDER = Symbol('CACHE_PROVIDER');

