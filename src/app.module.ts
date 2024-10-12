import { ApiModule } from '@/apis/api.module';
import { AppController } from '@/app.controller';
import { providers } from '@/app.provider';
import { LoggerMiddleware } from '@/common/middlewares/log.middlewares';
import { AbilityModule } from '@/module/ability/ability.module';
import { ConfigModule } from '@/module/configs/config.module';
import { DatabaseModule } from '@/module/database/database.module';
import { I18NModule } from '@/module/i18n/i18n.module';
import { RateLimitModule } from '@/module/ratelimit/ratelimit.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SeedModule } from './module/database/seeds/seed.module';

@Module({
	imports: [
		ConfigModule,
		DatabaseModule,
		ApiModule,
		AbilityModule,
		RateLimitModule,
		I18NModule,
		SeedModule
	],
	controllers: [AppController],
	providers
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
