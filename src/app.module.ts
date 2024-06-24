import { ApiModule } from '@/apis/api.module';
import { AppController } from '@/app.controller';
import { providers } from '@/app.provider';
import { LoggerMiddleware } from '@/common/middlewares/log.middlewares';
import { ConfigModule } from '@/module/configs/config.module';
import { DatabaseModule } from '@/module/database/database.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AbilityModule } from './module/ability/ability.module';
@Module({
	imports: [ConfigModule, DatabaseModule, ApiModule, AbilityModule],
	controllers: [AppController],
	providers
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
