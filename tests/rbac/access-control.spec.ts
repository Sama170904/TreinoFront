import { test, expect } from '../fixtures/auth.fixture';
import { loginViaApi } from '../helpers/api.helper';

test.describe('Suite 2: Control de Acceso por Rol (RBAC)', () => {
  test('2.1 CLIENTE no puede acceder a /admin y es redirigido', async ({ page }) => {
    const token = await loginViaApi('cliente@treino.com', 'cliente123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/admin');
    expect(page.url()).toContain('/clases');
  });

  test('2.2 CLIENTE no puede acceder a /teacher/clases y es redirigido', async ({ page }) => {
    const token = await loginViaApi('cliente@treino.com', 'cliente123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/teacher/clases');
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/teacher');
    expect(page.url()).toContain('/clases');
  });

  test('2.3 PROFESOR no puede acceder a /admin y es redirigido', async ({ page }) => {
    const token = await loginViaApi('profesor@treino.com', 'profe123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/admin');
    expect(page.url()).toContain('/teacher/clases');
  });

  test('2.4 PROFESOR no puede acceder a /clases (vista cliente) y es redirigido', async ({ page }) => {
    const token = await loginViaApi('profesor@treino.com', 'profe123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/clases');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/teacher/clases');
  });

  test('2.5 Usuario no autenticado es redirigido a /login al intentar abrir cualquier ruta', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/clases');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/teacher/clases');
    await expect(page).toHaveURL(/\/login/);
  });

  test('2.6 ADMINISTRADOR tiene acceso completo a /admin, /teacher/clases y /clases', async ({ page }) => {
    const token = await loginViaApi('admin@treino.com', 'admin123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    await page.goto('/teacher/clases');
    await expect(page).toHaveURL(/\/teacher\/clases/);

    await page.goto('/clases');
    await expect(page).toHaveURL(/\/clases/);
  });
});
