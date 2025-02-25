import { ConfigModule } from '@/module/configs/config.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          // TODO: move to env
          // { name: 'short', limit: 3, ttl: seconds(1) },
          // { name: 'medium', limit: 20, ttl: seconds(10) },
          { name: 'long', limit: 100, ttl: minutes(1) },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            port: config.getOrThrow<number>('REDIS_PORT'),
            host: config.getOrThrow<string>('REDIS_HOST'),
            db: config.getOrThrow<number>('REDIS_DB'),
            password: config.getOrThrow<string>('REDIS_PASSWORD'),
            keyPrefix: config.getOrThrow<string>('REDIS_PREFIX'),
          })
        ),
      }),
    }),
  ],
})
export class RateLimitModule {}
