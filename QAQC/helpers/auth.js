const { expect } = require('@playwright/test');

function requireCredentials() {
  const username = process.env.QAQC_USERNAME;
  const password = process.env.QAQC_PASSWORD;
  if (!username || !password) {
    throw new Error('QAQC_USERNAME and QAQC_PASSWORD are required in .env.qaqc');
  }
  return { username, password };
}

async function login(page, outletId) {
  const { username, password } = requireCredentials();
  const isLoginRequest = (request) =>
    new URL(request.url()).pathname === '/login' && request.method() === 'POST';

  let loggedIn = false;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto('/login');
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);

    const loginResult = Promise.race([
      page.waitForResponse((response) => isLoginRequest(response.request()), { timeout: 15_000 })
        .then((response) => ({ response })),
      page.waitForEvent('requestfailed', { predicate: isLoginRequest, timeout: 15_000 })
        .then((request) => ({ request }))
    ]);

    await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click();

    let response;
    let request;
    try {
      ({ response, request } = await loginResult);
    } catch (error) {
      if (error.name !== 'TimeoutError' || attempt === 3) throw error;
      await page.waitForTimeout(attempt * 1_000);
      continue;
    }

    if (request) {
      if (attempt === 3) {
        throw new Error(`Login request failed: ${request.failure()?.errorText || 'network error'}`);
      }
      await page.waitForTimeout(attempt * 1_000);
      continue;
    }

    const body = await response.text();
    if (response.ok()) {
      loggedIn = true;
      break;
    }

    const transientClosedConnection = response.status() === 500 &&
      body.includes("Can't add new command when connection is in closed state");
    if (!transientClosedConnection || attempt === 3) {
      throw new Error(`Login failed: HTTP ${response.status()} ${body}`);
    }

    await page.waitForTimeout(attempt * 1_000);
  }

  expect(loggedIn, 'Login must succeed within 3 attempts').toBeTruthy();
  await expect(page).not.toHaveURL(/\/login(?:$|\?)/, { timeout: 20_000 });

  const tokenOutletId = await page.evaluate(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    return Number(JSON.parse(atob(payload)).outlet_id);
  });

  expect(tokenOutletId, `QAQC account must belong to outlet ${outletId}`).toBe(outletId);
}

module.exports = { login };
