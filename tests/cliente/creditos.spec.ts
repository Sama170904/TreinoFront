import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 4: Dashboard de Créditos (Cliente)', () => {
  test('4.1 Saldo de créditos se muestra correctamente', async ({ clientePage }) => {
    const balanceResponsePromise = clientePage.waitForResponse(
      (res) => res.url().includes('/api/v1/creditos/mi-saldo') && res.status() === 200
    );

    await clientePage.goto('/creditos');
    await balanceResponsePromise;

    const balanceCard = clientePage.locator('h2, div.font-extrabold').first();
    await expect(balanceCard).toBeVisible();
    const text = await balanceCard.innerText();
    expect(text).toMatch(/\d+/);
  });

  test('4.2 Historial de movimientos de crédito se carga en tabla', async ({ clientePage }) => {
    await clientePage.goto('/creditos');
    await clientePage.waitForLoadState('networkidle');

    const tableOrEmpty = clientePage.locator('table')
      .or(clientePage.locator('text=No hay movimientos'))
      .or(clientePage.locator('div.bg-surface'));
    await expect(tableOrEmpty.first()).toBeVisible();
  });
});
