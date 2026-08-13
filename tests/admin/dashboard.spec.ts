import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 7: Dashboard de Administrador', () => {
  test('7.1 Cargar KPIs y accesos directos del administrador', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await adminPage.waitForLoadState('networkidle');

    const heading = adminPage.locator('h1');
    await expect(heading).toContainText(/Panel de Control|Administración/i);

    const userShortcut = adminPage.locator('a[href="/admin/usuarios"], div:has-text("Usuarios")').first();
    await expect(userShortcut).toBeVisible();
  });
});
