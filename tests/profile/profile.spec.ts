import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 10: Perfil del Usuario', () => {
  test('10.1 Cargar perfil propio en /profile', async ({ clientePage }) => {
    await clientePage.goto('/profile');
    await clientePage.waitForLoadState('networkidle');

    const emailElement = clientePage.locator('text=cliente@treino.com').or(clientePage.locator('input[type="email"]'));
    await expect(emailElement.first()).toBeVisible();
  });
});
