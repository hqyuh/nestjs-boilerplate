import { AppModule } from '@/app.module';
import { DOCUMENT_PATH, GLOBAL_PATH } from '@/common/constant/route.constant';
import { MsgIds, logger } from '@/common/logger/logger';
import { setupSwagger } from '@/common/swagger';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix(GLOBAL_PATH);

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<string>('PORT') || 3000;
	const nodeEnv = configService.get<string>('NODE_ENV');

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
}

bootstrap();
