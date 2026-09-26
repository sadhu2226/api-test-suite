// tests/auth.spec.js
//
// Authentication endpoints, using ReqRes's documented fixture account
// (eve.holt@reqres.in). Paths here do NOT start with a leading "/" - see the
// note at the top of users.get.spec.js for why (baseURL joining with a
// trailing slash).

const { test, expect } = require('@playwright/test');

const REGISTERED_EMAIL = 'eve.holt@reqres.in'; // documented ReqRes fixture account
const VALID_PASSWORD = 'cityslicka';

test.describe('POST /register', () => {
  test('succeeds with a known, registrable email + password', async ({ request }) => {
    const response = await request.post('register', {
      data: { email: REGISTERED_EMAIL, password: VALID_PASSWORD },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.token).toBeTruthy();
  });

  test('fails with 400 when password is missing', async ({ request }) => {
    const response = await request.post('register', {
      data: { email: REGISTERED_EMAIL },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('fails with 400 when email is missing', async ({ request }) => {
    const response = await request.post('register', {
      data: { password: VALID_PASSWORD },
    });

    expect(response.status()).toBe(400);
  });

  test('fails for an email that is not a registrable fixture account', async ({ request }) => {
    const response = await request.post('register', {
      data: { email: 'not.a.real.user@example.com', password: VALID_PASSWORD },
    });

    // ReqRes only allows a small set of seeded emails to register successfully.
    expect(response.status()).toBe(400);
  });
});

test.describe('POST /login', () => {
  test('succeeds with valid credentials and returns a token', async ({ request }) => {
    const response = await request.post('login', {
      data: { email: REGISTERED_EMAIL, password: VALID_PASSWORD },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('fails with 400 when password is missing', async ({ request }) => {
    const response = await request.post('login', {
      data: { email: REGISTERED_EMAIL },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/password/i);
  });

  test('fails with 400 for an unregistered email', async ({ request }) => {
    const response = await request.post('login', {
      data: { email: 'ghost.user@example.com', password: 'whatever123' },
    });

    expect(response.status()).toBe(400);
  });
});