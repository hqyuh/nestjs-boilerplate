import type { NestExpressApplication } from '@nestjs/platform-express';

import { API, authHeader, createTestApp, http, login } from './helpers/app';

describe.each(['1', '2'])('User API v%s (e2e)', (version) => {
  let app: NestExpressApplication;
  let accessToken: string;
  let cookies: string[];
  const stamp = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    ({ accessToken, cookies } = await login(app, 'admin01@example.com', '123456', version));
  }, 30_000);

  afterAll(async () => {
    await app?.close();
  });

  it('rejects unauthenticated access', async () => {
    await http(app).get(`${API}/v${version}/user`).expect(401);
  });

  it('lets a regular user get only their own profile', async () => {
    const list = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    const self = list.body.data.find((user: { email?: string }) => user.email === 'user01@example.com');
    expect(self?.id).toEqual(expect.any(String));

    const other = list.body.data.find((user: { email?: string }) => user.email === 'user02@example.com');
    expect(other?.id).toEqual(expect.any(String));

    const userSession = await login(app, 'user01@example.com', '123456', version);
    const own = await http(app)
      .get(`${API}/v${version}/user/${self.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .expect(200);

    expect(own.body.status).toBe(200);

    await http(app)
      .get(`${API}/v${version}/user/${other.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .expect(403);
  });

  it('lets a regular user update only their own profile', async () => {
    const list = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    const other = list.body.data.find(
      (user: { email?: string; roleId?: string; role?: { id?: string } }) => user.email === 'user02@example.com'
    );
    const roleId = other?.roleId ?? other?.role?.id;
    expect(other?.id).toEqual(expect.any(String));
    expect(roleId).toEqual(expect.any(String));

    const email = `e2e.own.v${version}.${stamp}@example.com`;
    await http(app)
      .post(`${API}/v${version}/user`)
      .set(authHeader(accessToken, cookies))
      .send({ username: email, firstName: 'Own', lastName: 'User', isActive: true, roleId })
      .expect((res) => {
        if (res.status >= 300) throw new Error(`POST /user failed: ${res.status} ${JSON.stringify(res.body)}`);
      });

    const createdList = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);
    const self = createdList.body.data.find((user: { email?: string }) => user.email === email);
    expect(self?.id).toEqual(expect.any(String));

    const userSession = await login(app, email, 'password', version);

    await http(app)
      .patch(`${API}/v${version}/user/${self.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .send({ firstName: 'SelfPatched' })
      .expect(200);

    await http(app)
      .patch(`${API}/v${version}/user/${other.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .send({ firstName: 'Nope' })
      .expect(403);

    await http(app)
      .delete(`${API}/v${version}/user/${other.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .expect(403);

    await http(app)
      .delete(`${API}/v${version}/user/${self.id}`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .expect(403);

    await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 10 })
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .expect(403);

    await http(app)
      .post(`${API}/v${version}/user`)
      .set(authHeader(userSession.accessToken, userSession.cookies))
      .send({ username: `e2e.nope.v${version}.${stamp}@example.com`, firstName: 'No', lastName: 'Pe', isActive: true, roleId })
      .expect(403);
  });

  it('lists users for an admin', async () => {
    const { body } = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 10 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.pagination).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: expect.any(Number),
      })
    );
  });

  it('gets, updates, and deletes a user created via register', async () => {
    const email = `e2e.user.v${version}.${stamp}@example.com`;

    await http(app)
      .post(`${API}/v${version}/auth/register`)
      .send({
        email,
        password: 'password1',
        firstName: 'Patch',
        lastName: 'Me',
      })
      .expect(201);

    const list = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    const created = list.body.data.find((user: { email?: string }) => user.email === email);
    expect(created?.id).toEqual(expect.any(String));

    const one = await http(app)
      .get(`${API}/v${version}/user/${created.id}`)
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(one.body.status).toBe(200);

    await http(app)
      .patch(`${API}/v${version}/user/${created.id}`)
      .set(authHeader(accessToken, cookies))
      .send({ firstName: 'Patched' })
      .expect(200);

    await http(app)
      .delete(`${API}/v${version}/user/${created.id}`)
      .set(authHeader(accessToken, cookies))
      .expect(200);

    await http(app)
      .get(`${API}/v${version}/user/${created.id}`)
      .set(authHeader(accessToken, cookies))
      .expect(404);
  });

  it('creates a user through POST /user', async () => {
    const list = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    const sample = list.body.data.find((user: { roleId?: string; role?: { id?: string } }) => user.roleId || user.role?.id);
    const roleId = sample?.roleId ?? sample?.role?.id;
    expect(roleId).toEqual(expect.any(String));
    const email = `e2e.post.v${version}.${stamp}@example.com`;

    const created = await http(app)
      .post(`${API}/v${version}/user`)
      .set(authHeader(accessToken, cookies))
      .send({
        username: email,
        firstName: 'Created',
        lastName: 'ViaPost',
        isActive: true,
        roleId,
      });

    if (created.status >= 300) {
      throw new Error(`POST /user failed: ${created.status} ${JSON.stringify(created.body)}`);
    }

    const fetched = await http(app)
      .get(`${API}/v${version}/user`)
      .query({ page: 1, limit: 100 })
      .set(authHeader(accessToken, cookies))
      .expect(200);

    expect(fetched.body.data.some((user: { email?: string }) => user.email === email)).toBe(true);
  });
});
