import { ConfigModule } from '@/module/configs/config.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';

import { RedisConfig } from '../configs/interfaces/config.interface';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisConfig = config.getOrThrow<RedisConfig>('app.redis');
        return {
          throttlers: [
            // { name: 'short', limit: 3, ttl: seconds(1) },
            // { name: 'medium', limit: 20, ttl: seconds(10) },
            { name: 'long', limit: 100, ttl: minutes(1) },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              port: redisConfig.port,
              host: redisConfig.host,
              username: redisConfig.username,
              password: redisConfig.password,
              keyPrefix: redisConfig.keyPrefix,
            })
          ),
        };
      },
    }),
  ],
})
export class RateLimitModule {}
