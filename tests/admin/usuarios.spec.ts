import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 8: Gestión de Usuarios y Créditos (Admin)', () => {
  test('8.1 Listar todos los usuarios en /admin/usuarios', async ({ adminPage }) => {
    await adminPage.goto('/admin/usuarios');
    await adminPage.waitForLoadState('networkidle');

    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('8.2 Asignar créditos a un cliente abre modal y envía DTO', async ({ adminPage }) => {
    await adminPage.goto('/admin/usuarios');
    await adminPage.waitForLoadState('networkidle');

    const creditButtons = adminPage.locator('button:has-text("Asignar Créditos")');
    const count = await creditButtons.count();

    if (count > 0) {
      await creditButtons.first().click();

      const modal = adminPage.locator('div.fixed.inset-0');
      await expect(modal).toBeVisible();

      await adminPage.fill('input[type="number"]', '5');

      const assignPromise = adminPage.waitForResponse(
        (res) => res.url().includes('/api/v1/creditos/asignar') && res.status() === 200
      );

      await adminPage.click('div.fixed form button[type="submit"]');
      const res = await assignPromise;
      expect(res.status()).toBe(200);

      const alertSuccess = adminPage.locator('text=asignados exitosamente');
      await expect(alertSuccess).toBeVisible();
    }
  });
});
