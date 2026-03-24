import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cacheable, CacheableItem } from 'cacheable';

import { ICacheService } from './cache.interface';

export class CacheService extends ICacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cacheable) {
    super();
  }

  async set<T>(key: string, value: T, expired?: number | string): Promise<boolean> {
    await this.delete(key);
    return this.cache.set(key, value as T, expired);
  }

  async setMany(items: CacheableItem[]): Promise<boolean> {
    const keys = items.map((i) => i.key);
    await this.deleteMany(keys);
    return await this.cache.setMany(items);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async delete(key: string): Promise<boolean> {
    return await this.cache.delete(key);
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    return await this.cache.deleteMany(keys);
  }
}
