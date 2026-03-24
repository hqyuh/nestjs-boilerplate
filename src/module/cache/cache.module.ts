import { URL } from 'node:url';
import KeyvRedis from '@keyv/redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigModule } from '../configs/config.module';
import { RedisConfig } from '../configs/interfaces/config.interface';
import { ICacheService } from './cache.interface';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    ConfigModule,
    {
      provide: CACHE_MANAGER,
      useFactory(config: ConfigService) {
        const redisConfig = config.getOrThrow<RedisConfig>('app.redis');

        // URL constructor will automatically encode username and password
        const redisUrl = new URL(
          `redis://${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`
        );

        const redis = new KeyvRedis(redisUrl.toString(), {
          keyPrefixSeparator: redisConfig.keyPrefix,
        });
        return redis;
      },
      inject: [ConfigService],
    },
    {
      provide: ICacheService,
      useClass: CacheService,
    },
  ],
  exports: [ICacheService],
})
export class CacheModule {}
