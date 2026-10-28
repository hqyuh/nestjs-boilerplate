import type { NestExpressApplication } from '@nestjs/platform-express';
import { OAuth2Client } from 'google-auth-library';
import { Strategy as FacebookOAuthStrategy } from 'passport-facebook';
import { Strategy as GoogleOAuthStrategy } from 'passport-google-oauth20';
import { vi } from 'vitest';

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

  it('rejects an invalid Google ID token', async () => {
    await http(app).post(`${API}/v${version}/auth/google/mobile`).send({ idToken: 'not-a-google-token' }).expect(401);
  });

  it('returns a Google auth URL for API clients such as Swagger', async () => {
    const { status, body } = await http(app).get(`${API}/v${version}/auth/google`).redirects(0);

    expect(status).toBe(200);
    expect(body.data.url).toContain('accounts.google.com');
  });

  it('redirects browser navigations to Google without following the remote URL', async () => {
    const { status, headers } = await http(app)
      .get(`${API}/v${version}/auth/google`)
      .set('Sec-Fetch-Mode', 'navigate')
      .redirects(0);

    expect(status).toBe(302);
    expect(headers.location).toContain('accounts.google.com');
  });

  it('logs in with a mocked Google ID token and sets the refresh cookie', async () => {
    const verify = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        sub: `google-sub-v${version}-${stamp}`,
        email: `e2e.google.v${version}.${stamp}@example.com`,
        given_name: 'Google',
        family_name: 'User',
        picture: 'https://lh3.googleusercontent.com/a/e2e-google-avatar',
      }),
    } as never);

    try {
      const res = await http(app)
        .post(`${API}/v${version}/auth/google/mobile`)
        .send({ idToken: 'mocked-google-id-token' })
        .expect(200);

      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.refreshToken).toEqual(expect.any(String));
      const setCookie = res.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
      expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);
    } finally {
      verify.mockRestore();
    }
  });

  it('issues tokens on Google OAuth callback with a mocked strategy', async () => {
    const authenticate = vi.spyOn(GoogleOAuthStrategy.prototype, 'authenticate').mockImplementation(function (this: {
      success: (user: unknown) => void;
    }) {
      this.success({
        providerAccountId: `google-cb-v${version}-${stamp}`,
        email: `e2e.google.cb.v${version}.${stamp}@example.com`,
        firstName: 'Google',
        lastName: 'Callback',
        avatarUrl: 'https://lh3.googleusercontent.com/a/e2e-google-callback-avatar',
      });
    });

    try {
      const res = await http(app).get(`${API}/v${version}/auth/google/callback`).redirects(0);
      const setCookie = res.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
      expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);

      const frontendRedirect = process.env.GOOGLE_FRONTEND_REDIRECT;
      if (frontendRedirect) {
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe(frontendRedirect);
      } else {
        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toEqual(expect.any(String));
        expect(res.body.data.refreshToken).toEqual(expect.any(String));
      }
    } finally {
      authenticate.mockRestore();
    }
  });

  it('rejects an invalid Facebook access token', async () => {
    await http(app)
      .post(`${API}/v${version}/auth/facebook/mobile`)
      .send({ accessToken: 'not-a-facebook-token' })
      .expect(401);
  });

  it('returns a Facebook auth URL for API clients such as Swagger', async () => {
    const { status, body } = await http(app).get(`${API}/v${version}/auth/facebook`).redirects(0);

    expect(status).toBe(200);
    expect(body.data.url).toContain('facebook.com');
  });

  it('redirects browser navigations to Facebook without following the remote URL', async () => {
    const { status, headers } = await http(app)
      .get(`${API}/v${version}/auth/facebook`)
      .set('Sec-Fetch-Mode', 'navigate')
      .redirects(0);

    expect(status).toBe(302);
    expect(headers.location).toContain('facebook.com');
  });

  it('logs in with a mocked Facebook access token and sets the refresh cookie', async () => {
    const graph = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes('/debug_token')
        ? { data: { is_valid: true, app_id: process.env.FACEBOOK_APP_ID } }
        : {
            id: `facebook-id-v${version}-${stamp}`,
            email: `e2e.facebook.v${version}.${stamp}@example.com`,
            first_name: 'Facebook',
            last_name: 'User',
            picture: { data: { url: 'https://graph.facebook.com/e2e-facebook-avatar' } },
          };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    try {
      const res = await http(app)
        .post(`${API}/v${version}/auth/facebook/mobile`)
        .send({ accessToken: 'mocked-facebook-access-token' })
        .expect(200);

      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.refreshToken).toEqual(expect.any(String));
      const setCookie = res.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
      expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);
    } finally {
      graph.mockRestore();
    }
  });

  it('issues tokens on Facebook OAuth callback with a mocked strategy', async () => {
    const authenticate = vi.spyOn(FacebookOAuthStrategy.prototype, 'authenticate').mockImplementation(function (this: {
      success: (user: unknown) => void;
    }) {
      this.success({
        providerAccountId: `facebook-cb-v${version}-${stamp}`,
        email: `e2e.facebook.cb.v${version}.${stamp}@example.com`,
        firstName: 'Facebook',
        lastName: 'Callback',
        avatarUrl: 'https://graph.facebook.com/e2e-facebook-callback-avatar',
      });
    });

    try {
      const res = await http(app).get(`${API}/v${version}/auth/facebook/callback`).redirects(0);
      const setCookie = res.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
      expect(cookies.some((cookie) => cookie.startsWith('refresh-token='))).toBe(true);

      const frontendRedirect = process.env.FACEBOOK_FRONTEND_REDIRECT || process.env.GOOGLE_FRONTEND_REDIRECT;
      if (frontendRedirect) {
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe(frontendRedirect);
      } else {
        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toEqual(expect.any(String));
        expect(res.body.data.refreshToken).toEqual(expect.any(String));
      }
    } finally {
      authenticate.mockRestore();
    }
  });
});
