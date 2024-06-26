import { ClassSerializerInterceptor, Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/exceptions/global.filter.error';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
// import { ValidationPipe } from './common/pipes/validation.pipe';

export const providers: Provider[] = [
	AppService,
	/** The Pipe used here or globally in main.ts */
	// {
	// 	provide: APP_PIPE,
	// 	useClass: ValidationPipe
	// },
	{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
	{ provide: APP_INTERCEPTOR, useClass: FormatResponseInterceptor },
	{ provide: APP_FILTER, useClass: GlobalExceptionFilter }
];
