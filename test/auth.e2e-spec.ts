import type { NestExpressApplication } from '@nestjs/platform-express';

import { API, authHeader, createTestApp, http, login } from './helpers/app';

describe.each(['1', '2'])('Auth API v%s (e2e)', (version) => {
  let app: NestExpressApplication;
  const stamp = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user', async () => {
    const { body } = await http(app)
      .post(`${API}/v${version}/auth/register`)
      .send({
        email: `e2e.v${version}.${stamp}@example.com`,
        password: 'password1',
        firstName: 'E2e',
        lastName: 'User',
      })
      .expect(201);

    expect(body.status).toBe(201);
    expect(body.data.success).toBe(true);
  });

  it('rejects duplicate registration', async () => {
    await http(app)
      .post(`${API}/v${version}/auth/register`)
      .send({
        email: `e2e.dup.v${version}.${stamp}@example.com`,
        password: 'password1',
        firstName: 'E2e',
        lastName: 'Dup',
      })
      .expect(201);

    await http(app)
      .post(`${API}/v${version}/auth/register`)
      .send({
        email: `e2e.dup.v${version}.${stamp}@example.com`,
        password: 'password1',
        firstName: 'E2e',
        lastName: 'Dup',
      })
      .expect(409);
  });

  it('logs in with seeded admin credentials', async () => {
    const { accessToken, refreshToken, cookies } = await login(app, 'admin01@example.com', '123456', version);

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
    expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);
  });

  it('rejects invalid credentials', async () => {
    await http(app)
      .post(`${API}/v${version}/auth/login`)
      .send({ email: 'admin01@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('refreshes tokens with cookie + bearer', async () => {
    const { accessToken, cookies } = await login(app, 'admin01@example.com', '123456', version);

    const { body } = await http(app)
      .post(`${API}/v${version}/auth/refresh-token`)
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(body.data.accessToken).toEqual(expect.any(String));
    expect(body.data.refreshToken).toEqual(expect.any(String));
    expect(body.data.accessToken).not.toBe(accessToken);
  });

  it('logs out and rejects the old access token', async () => {
    const { accessToken, cookies } = await login(app, 'admin01@example.com', '123456', version);

    const { body } = await http(app)
      .get(`${API}/v${version}/auth/logout`)
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(body.data.success).toBe(true);

    await http(app).get(`${API}/v1/rbac-admin`).set(authHeader(accessToken, cookies)).expect(401);
  });
});
