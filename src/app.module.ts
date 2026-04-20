import { randomUUID } from 'crypto';
import { ApiModule } from '@/apis/api.module';
import { AppController } from '@/app.controller';
import { providers } from '@/app.provider';
import { LoggerMiddleware } from '@/common/middlewares/log.middlewares';
import { AbilityModule } from '@/module/ability/ability.module';
import { DatabaseModule } from '@/module/database/database.module';
import { I18NModule } from '@/module/i18n/i18n.module';
import { RateLimitModule } from '@/module/ratelimit/ratelimit.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import type { Request } from 'express';
import { ClsModule } from 'nestjs-cls';

import { ConfigModule } from './module/configs/config.module';
import { SeedModule } from './module/database/seeds/seed.module';

@Module({
  imports: [
    ConfigModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => {
          const raw = req.headers['x-request-id'];
          const fromHeader = (Array.isArray(raw) ? raw[0] : raw)?.toString().trim();
          return fromHeader || randomUUID();
        },
      },
    }),
    DatabaseModule,
    ApiModule,
    AbilityModule,
    RateLimitModule,
    I18NModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '/api/*path', method: RequestMethod.ALL });
  }
}
