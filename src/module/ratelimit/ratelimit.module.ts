import { ConfigModule } from '@/module/configs/config.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, minutes } from '@nestjs/throttler';
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
					{ name: 'long', limit: 100, ttl: minutes(1) }
				],
				storage: new ThrottlerStorageRedisService(
					new Redis({
						port: config.get<number>('REDIS_PORT'),
						host: config.get<string>('REDIS_HOST'),
						db: config.get<number>('REDIS_DB'),
						password: config.get<string>('REDIS_PASSWORD'),
						keyPrefix: config.get<string>('REDIS_PREFIX')
					})
				)
			})
		})
	]
})
export class RateLimitModule {}
