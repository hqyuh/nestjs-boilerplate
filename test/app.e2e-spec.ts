import type { NestExpressApplication } from '@nestjs/platform-express';

import { API, authHeader, createTestApp, http, login } from './helpers/app';

describe('App API (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1 returns app metadata', async () => {
    const { body } = await http(app).get(`${API}/v1`).expect(200);

    expect(body.status).toBe(200);
    expect(body.path).toBe('/api/v1');
    expect(body.method).toBe('GET');
    expect(typeof body.timestamp).toBe('string');
  });

  it('GET /api/v1/rbac-admin requires auth', async () => {
    await http(app).get(`${API}/v1/rbac-admin`).expect(401);
  });

  it('GET /api/v1/rbac-admin succeeds for admin', async () => {
    const { accessToken, cookies } = await login(app, 'admin01@example.com', '123456');

    const { body } = await http(app)
      .get(`${API}/v1/rbac-admin`)
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(body.status).toBe(200);
  });

  it('GET /api/v1/rbac-user is forbidden for a regular user', async () => {
    const { accessToken, cookies } = await login(app, 'user01@example.com', '123456');

    await http(app).get(`${API}/v1/rbac-user`).set(authHeader(accessToken, cookies)).expect(403);
  });
});
