import { test as base, Page } from '@playwright/test';
import { loginViaApi } from '../helpers/api.helper';

type AuthFixtures = {
  clientePage: Page;
  profesorPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  clientePage: async ({ page }, use) => {
    const token = await loginViaApi('cliente@treino.com', 'cliente123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.goto('/clases');
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  profesorPage: async ({ page }, use) => {
    const token = await loginViaApi('profesor@treino.com', 'profe123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.goto('/teacher/clases');
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    const token = await loginViaApi('admin@treino.com', 'admin123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect } from '@playwright/test';
