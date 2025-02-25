import { MetadataKey } from '@/common/constant/constants';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { ICacheService } from './cache.interface';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: MetadataKey.REDIS,
      useFactory(config: ConfigService) {
        return new Redis({
          port: config.getOrThrow<number>('REDIS_PORT'),
          host: config.getOrThrow<string>('REDIS_HOST'),
          db: config.getOrThrow<number>('REDIS_DB'),
          password: config.getOrThrow<string>('REDIS_PASSWORD'),
          keyPrefix: config.getOrThrow<string>('REDIS_PREFIX'),
        });
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
