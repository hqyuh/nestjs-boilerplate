import { ClassSerializerInterceptor, Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/exceptions/global.filter.error';
import { IResponseError } from './common/exceptions/global.response.error';
import { TypeOrmFilter } from './common/filters/typeorm.filter';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';

export const providers: Provider[] = [
  AppService,
  { provide: APP_GUARD, useClass: ThrottlerGuard },

  // Interceptors
  { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  { provide: APP_INTERCEPTOR, useClass: FormatResponseInterceptor },

  // Pipes
  {
    provide: APP_PIPE,
    useFactory() {
      return new I18nValidationPipe({
        transform: true,
        whitelist: true,
      });
    },
  },

  // Filters
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  { provide: APP_FILTER, useClass: TypeOrmFilter },
  {
    provide: APP_FILTER,
    useFactory() {
      return new I18nValidationExceptionFilter({
        errorFormatter(errors) {
          return errors.map(({ property, constraints }) => {
            const key = Object.keys(constraints || {})[0];
            const error = constraints?.[key] || 'Invalid';
            return {
              property,
              error,
            };
          });
        },
        responseBodyFormatter(host, exc, formattedErrors) {
          const request = host.switchToHttp().getRequest<Request>();
          const status = exc.getStatus();
          return {
            statusCode: status,
            message: 'Bad Request',
            detail: formattedErrors,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          } satisfies IResponseError;
        },
      });
    },
  },
];
