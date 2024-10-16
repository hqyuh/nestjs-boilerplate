import { AppModule } from '@/app.module';
import { DOCUMENT_PATH, GLOBAL_PATH } from '@/common/constant/route.constant';
import { logger, MsgIds } from '@/common/logger/logger';
import { setupSwagger } from '@/common/swagger';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

export async function bootstrap(): Promise<NestExpressApplication> {
	initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		abortOnError: true
	});

	app.setGlobalPrefix(GLOBAL_PATH);

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<string>('PORT') || 3000;
	const nodeEnv = configService.get<string>('NODE_ENV');

	app.use(helmet());
	app.use(compression());
	app.use(morgan('combined'));

	app.enableCors({
		origin: true,
		credentials: true
	});

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1'
	});

	setupSwagger(app);

	await app.listen(port).then(async () => {
		const url = await app.getUrl();
		const parameters = {
			port,
			environment: nodeEnv,
			documentation: `${url}/${DOCUMENT_PATH}`
		};
		logger.writeWithParameter(MsgIds.M002001, parameters);
	});

	return app;
}

void bootstrap();
