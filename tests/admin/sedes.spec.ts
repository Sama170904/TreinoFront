import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 9: Gestión de Sedes (Admin)', () => {
  test('9.1 Listar sedes existentes en /admin/sedes', async ({ adminPage }) => {
    await adminPage.goto('/admin/sedes');
    await adminPage.waitForLoadState('networkidle');

    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
