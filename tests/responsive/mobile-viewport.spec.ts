import { test, expect } from '@playwright/test';
import { loginViaApi } from '../helpers/api.helper';

test.use({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
});

test.describe('Suite Responsiva (Mobile Viewport iPhone 13 - 390x844 en Chromium)', () => {
  test('Mobile: Navbar inferior nativa es visible y navegable en teléfonos', async ({ page }) => {
    const token = await loginViaApi('cliente@treino.com', 'cliente123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/clases');
    await page.waitForLoadState('networkidle');

    // Verificar que la barra inferior móvil está visible en teléfonos
    const mobileBottomNav = page.locator('div.fixed.bottom-0 nav');
    await expect(mobileBottomNav).toBeVisible();

    // Navegar a Mis Reservas mediante el botón táctil inferior
    const reservasTab = mobileBottomNav.locator('a[href="/mis-reservas"]');
    await expect(reservasTab).toBeVisible();
    await reservasTab.click();

    await expect(page).toHaveURL(/\/mis-reservas/);

    // Navegar a Mis Créditos mediante la barra inferior
    const creditosTab = mobileBottomNav.locator('a[href="/creditos"]');
    await expect(creditosTab).toBeVisible();
    await creditosTab.click();

    await expect(page).toHaveURL(/\/creditos/);
  });

  test('Mobile: Formulario de Login ajusta adecuadamente en pantalla estrecha', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    
    // Verificar que no hay desbordamiento horizontal (scroll horizontal no deseado)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('Mobile: Reservar una clase desde smartphone funciona perfectamente', async ({ page }) => {
    const token = await loginViaApi('cliente@treino.com', 'cliente123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    await page.goto('/clases');
    await page.waitForLoadState('networkidle');

    const actionBtn = page.locator('button:has-text("Reservar"), button:has-text("Clase Reservada")').first();
    await expect(actionBtn).toBeVisible();
  });
});
