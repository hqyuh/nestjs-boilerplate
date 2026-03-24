import { getEnv } from '@/module/configs/env';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import configuration, { validate } from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnv(),
      load: [configuration],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
