import { AppModule } from '@/app.module';
import { GLOBAL_PATH } from '@/common/constant/route.constant';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { SuperAgentTest } from 'supertest';
import request from 'supertest';

import { SWAGGER_API_CURRENT_VERSION } from '../../src/common/swagger/swagger.const';

export const API = `/${GLOBAL_PATH}`;

export async function createTestApp(): Promise<NestExpressApplication> {
  process.env.AUTO_SEED = 'true';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error'],
  });

  app.setGlobalPrefix(GLOBAL_PATH);
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: SWAGGER_API_CURRENT_VERSION,
    prefix: 'v',
  });

  await app.init();
  return app;
}

export function http(app: NestExpressApplication): SuperAgentTest {
  return request(app.getHttpServer()) as unknown as SuperAgentTest;
}

export async function login(
  app: NestExpressApplication,
  email: string,
  password: string,
  version = '1'
): Promise<{ accessToken: string; refreshToken: string; cookies: string[] }> {
  const res = await http(app).post(`${API}/v${version}/auth/login`).send({ email, password }).expect(200);

  const setCookie = res.headers['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    cookies,
  };
}

export function authHeader(accessToken: string, cookies: string[] = []) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Cookie: cookies,
  };
}
