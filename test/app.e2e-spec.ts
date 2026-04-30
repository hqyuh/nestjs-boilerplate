import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { FormatResponseInterceptor } from '@/common/interceptors/format-response.interceptor';
import { AbilityFactory } from '@/module/ability/ability.factory';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as packageJson from 'packageJson';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        AbilityFactory,
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
        { provide: APP_INTERCEPTOR, useClass: FormatResponseInterceptor },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: true,
      credentials: true,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) returns app metadata wrapped by FormatResponseInterceptor', async () => {
    const { body } = await request(app.getHttpServer()).get('/').expect(200);

    expect(body.status).toEqual(200);
    expect(body.path).toEqual('/');
    expect(body.method).toEqual('GET');
    expect(typeof body.timestamp).toBe('string');
  });

  it('exposes the package metadata via AppService', () => {
    const helloService = app.get(AppService);
    expect(helloService.getHello()).toEqual(`${packageJson.name} v${packageJson.version}`);
  });
});
