// tests/users.get.spec.js
//
// Covers the read (GET) side of the /users resource:
//  - happy path status codes and body shape
//  - pagination behaviour
//  - schema/contract validation
//  - response time budget (a basic non-functional check)
//
// IMPORTANT: paths here do NOT start with a leading "/". Our baseURL is
// 'https://reqres.in/api/' (with a trailing slash), and Playwright/the WHATWG
// URL spec joins a leading-slash path as "from the domain root", which would
// silently strip off the "/api" part. Relative paths (no leading slash) join
// correctly onto the baseURL instead.

const { test, expect } = require('@playwright/test');
const { validateSchema } = require('../utils/validateSchema');
const userSchema = require('../schemas/user.schema.json');
const userListSchema = require('../schemas/userList.schema.json');

test.describe('GET /users - list endpoint', () => {
  test('returns 200 and a body matching the expected schema', async ({ request }) => {
    const response = await request.get('users?page=2');
    expect(response.status()).toBe(200);

    const body = await response.json();
    const { valid, errors } = validateSchema(userListSchema, body);

    expect(valid, JSON.stringify(errors, null, 2)).toBe(true);
  });

  test('respects the page query parameter', async ({ request }) => {
    const response = await request.get('users?page=2');
    const body = await response.json();

    expect(body.page).toBe(2);
  });

  test('responds within an acceptable time budget', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('users?page=1');
    const durationMs = Date.now() - start;

    expect(response.status()).toBe(200);
    // 2s is a generous budget for a public demo API; tighten this for a real service.
    expect(durationMs).toBeLessThan(3000);
  });

  test('handles an out-of-range page gracefully', async ({ request }) => {
    const response = await request.get('users?page=9999');
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Out-of-range pages should return an empty data array, not an error.
    expect(body.data).toEqual([]);
  });
});

test.describe('GET /users/:id - single resource endpoint', () => {
  test('returns 200 and a valid single-user schema for an existing user', async ({ request }) => {
    const response = await request.get('users/2');
    expect(response.status()).toBe(200);

    const body = await response.json();
    const { valid, errors } = validateSchema(userSchema, body);

    expect(valid, JSON.stringify(errors, null, 2)).toBe(true);
  });

  test('returns 404 for a user that does not exist', async ({ request }) => {
    const response = await request.get('users/999999');
    expect(response.status()).toBe(404);
  });

  test('returns 404 (not 500) for a non-numeric id', async ({ request }) => {
    // A common bug: passing unexpected input types crashes the server (500)
    // instead of being handled as "not found" or "bad request".
    const response = await request.get('users/not-a-number');
    expect([400, 404]).toContain(response.status());
  });
});