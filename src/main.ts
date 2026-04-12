import { AppModule } from '@/app.module';
import { DOCUMENT_PATH, GLOBAL_PATH } from '@/common/constant/route.constant';
import { ensureRequestIdMiddleware, morganRequestIdToken } from '@/common/middlewares/correlation-id.middleware';
import { logger, MsgIds } from '@/common/logger/logger';
import { setupSwagger } from '@/common/swagger';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as morgan from 'morgan';

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: true,
  });

  app.use(ensureRequestIdMiddleware);

  app.setGlobalPrefix(GLOBAL_PATH);

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV');

  app.use(helmet());
  app.use(compression());
  morgan.token('request-id', morganRequestIdToken);
  const accessFormat =
    '[:request-id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :referrer :user-agent';
  app.use(
    morgan(accessFormat, {
      stream: {
        write(message: string): void {
          process.stdout.write(message);
          try {
            logger.logHttpAccess(message);
          } catch {
            /* never block access line on stdout */
          }
        },
      },
    })
  );
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  setupSwagger(app);

  await app.listen(port, '0.0.0.0').then(async () => {
    const url = await app.getUrl();
    const parameters = {
      port,
      environment: nodeEnv,
      documentation: `${url}/${DOCUMENT_PATH}`,
    };
    logger.writeWithParameter(MsgIds.M002001, parameters);
  });

  return app;
}

void bootstrap();
