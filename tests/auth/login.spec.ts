import { test, expect } from '@playwright/test';

test.describe('Suite 1: Autenticación & Sesión', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('1.1 Login exitoso como CLIENTE redirige a /clases y guarda token', async ({ page }) => {
    await page.fill('input[type="email"]', 'cliente@treino.com');
    await page.fill('input[type="password"]', 'cliente123');

    const loginResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/auth/login') && res.status() === 200
    );

    await page.click('button[type="submit"]');

    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(200);

    await expect(page).toHaveURL(/\/clases/);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(20);
  });

  test('1.2 Login exitoso como PROFESOR redirige a /teacher/clases', async ({ page }) => {
    await page.fill('input[type="email"]', 'profesor@treino.com');
    await page.fill('input[type="password"]', 'profe123');

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/v1/auth/login') && res.status() === 200),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/\/teacher\/clases/);
  });

  test('1.3 Login exitoso como ADMINISTRADOR redirige a /admin', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@treino.com');
    await page.fill('input[type="password"]', 'admin123');

    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/v1/auth/login') && res.status() === 200),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/\/admin/);
  });

  test('1.4 Login con credenciales inválidas muestra mensaje de error (401)', async ({ page }) => {
    await page.fill('input[type="email"]', 'cliente@treino.com');
    await page.fill('input[type="password"]', 'password_errada');

    const errorResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/auth/login') && (res.status() === 401 || res.status() === 400)
    );

    await page.click('button[type="submit"]');

    const errorResponse = await errorResponsePromise;
    expect([400, 401]).toContain(errorResponse.status());

    await expect(page).toHaveURL(/\/login/);
    const alert = page.locator('div.bg-red-50, div.alert-danger, [role="alert"]').first();
    await expect(alert).toBeVisible();
  });

  test('1.5 Intentar login con campos vacíos no envía petición', async ({ page }) => {
    let requestSent = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/login')) requestSent = true;
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(requestSent).toBe(false);
  });

  test('1.6 Logout destruye la sesión y redirige a /login', async ({ page }) => {
    await page.fill('input[type="email"]', 'cliente@treino.com');
    await page.fill('input[type="password"]', 'cliente123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/clases/);

    const logoutBtn = page.locator('button:has-text("Cerrar Sesión"), button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
