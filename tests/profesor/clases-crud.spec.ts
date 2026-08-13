import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 5: Programación de Clases (Profesor / Admin)', () => {
  test('5.1 Ver tabla de clases programadas', async ({ profesorPage }) => {
    await profesorPage.goto('/teacher/clases');
    await profesorPage.waitForLoadState('networkidle');

    const table = profesorPage.locator('table').or(profesorPage.locator('text=No hay clases programadas'));
    await expect(table.first()).toBeVisible();
  });

  test('5.2 Crear nueva clase exitosamente abre modal y envía DTO', async ({ profesorPage }) => {
    await profesorPage.goto('/teacher/clases');
    await profesorPage.waitForLoadState('networkidle');

    await profesorPage.click('button:has-text("Nueva Clase")');

    const modal = profesorPage.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();

    await profesorPage.fill('input[placeholder*="Pilates"]', 'HIIT E2E Test');
    await profesorPage.fill('input[type="number"]', '15');

    const createPromise = profesorPage.waitForResponse(
      (res) => res.url().includes('/api/v1/clases') && res.request().method() === 'POST'
    );

    await profesorPage.click('button:has-text("Programar Clase")');

    const createRes = await createPromise;
    expect(createRes.status()).toBe(200);

    const alertSuccess = profesorPage.locator('text=exitosa');
    await expect(alertSuccess).toBeVisible();
  });
});
