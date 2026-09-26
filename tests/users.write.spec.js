// tests/users.write.spec.js
//
// Covers the write side (POST / PUT / PATCH / DELETE) of the /users resource.
// Paths here do NOT start with a leading "/" - see the note at the top of
// users.get.spec.js for why (baseURL joining with a trailing slash).

const { test, expect } = require('@playwright/test');

test.describe('POST /users - create', () => {
  test('creates a user and echoes back submitted fields', async ({ request }) => {
    const payload = { name: 'Ada Lovelace', job: 'QA Engineer' };
    const response = await request.post('users', { data: payload });

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });

  test('handles an empty payload without crashing', async ({ request }) => {
    const response = await request.post('users', { data: {} });
    // The API accepts this permissively — we assert it doesn't error out (500),
    // which is the real risk with malformed/empty input.
    expect(response.status()).toBeLessThan(500);
  });

  test('handles unexpected extra fields gracefully', async ({ request }) => {
    const payload = { name: 'Grace Hopper', job: 'Admiral', extraField: 'should be ignored or accepted' };
    const response = await request.post('users', { data: payload });

    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('PUT /users/:id - full update', () => {
  test('updates a user and returns the updated fields', async ({ request }) => {
    const payload = { name: 'Ada Lovelace', job: 'Senior QA Engineer' };
    const response = await request.put('users/2', { data: payload });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe('Senior QA Engineer');
    expect(body.updatedAt).toBeTruthy();
  });
});

test.describe('PATCH /users/:id - partial update', () => {
  test('updates only the provided field', async ({ request }) => {
    const response = await request.patch('users/2', { data: { job: 'Lead QA Engineer' } });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe('Lead QA Engineer');
  });
});

test.describe('DELETE /users/:id', () => {
  test('deletes a user and returns 204 No Content', async ({ request }) => {
    const response = await request.delete('users/2');
    expect(response.status()).toBe(204);
  });

  test('deleting a non-existent user does not return a server error', async ({ request }) => {
    const response = await request.delete('users/999999');
    // Different APIs choose 204 (idempotent) or 404 here — either is acceptable,
    // what we're guarding against is a 500.
    expect(response.status()).toBeLessThan(500);
  });
});