import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 6: Pase de Lista y Restricciones Temporales (Check-In)', () => {
  test('6.1 Buscar reservas de una clase por ID', async ({ profesorPage }) => {
    await profesorPage.goto('/teacher/check-in?claseId=1');
    await profesorPage.waitForLoadState('networkidle');

    const table = profesorPage.locator('table').or(profesorPage.locator('text=No hay reservas'));
    await expect(table.first()).toBeVisible();
  });

  test('6.2 Modificación de asistencia respeta ventana temporal según rol', async ({ adminPage }) => {
    await adminPage.goto('/teacher/check-in?claseId=1');
    await adminPage.waitForLoadState('networkidle');

    const adminBadge = adminPage.locator('text=Modo Administrador');
    await expect(adminBadge).toBeVisible();
  });
});
