import { test, expect } from '@playwright/test';
import * as path from 'path';

test.use({
  viewport: { width: 1920, height: 1080 },
  video: {
    mode: 'on',
    size: { width: 1920, height: 1080 }
  }
});

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

test.describe('Video Promocional HD de Treino App', () => {
  test('1. Recorrido Promocional - Rol Cliente', async ({ page }) => {
    test.setTimeout(60000);

    console.log('🎬 Grabando Escena 1: Cliente...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await delay(1500);

    // Login Cliente
    await page.fill('input[type="email"]', 'cliente@treino.com');
    await delay(600);
    await page.fill('input[type="password"]', 'cliente123');
    await delay(800);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/clases/);
    await delay(2000);

    // 1.1 Parrilla de Clases
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await delay(1500);
    await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    await delay(1000);

    // Búsqueda en tiempo real
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Pilates');
      await delay(1500);
      await searchInput.clear();
      await delay(1000);
    }

    // Reservar Clase
    const reserveBtn = page.locator('button:has-text("Reservar")').first();
    if (await reserveBtn.isVisible()) {
      await reserveBtn.click();
      await delay(2000);
    }

    // 1.2 Mis Reservas
    await page.click('a[href="/mis-reservas"]');
    await page.waitForURL(/\/mis-reservas/);
    await delay(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await delay(1200);

    // 1.3 Mis Créditos
    await page.click('a[href="/creditos"]');
    await page.waitForURL(/\/creditos/);
    await delay(2000);

    // 1.4 Perfil de Usuario
    await page.click('a[href="/profile"]');
    await page.waitForURL(/\/profile/);
    await delay(2500);
  });

  test('2. Recorrido Promocional - Rol Profesor', async ({ page }) => {
    test.setTimeout(60000);

    console.log('🎬 Grabando Escena 2: Profesor...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await delay(1500);

    // Login Profesor
    await page.fill('input[type="email"]', 'profesor@treino.com');
    await delay(600);
    await page.fill('input[type="password"]', 'profe123');
    await delay(800);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/teacher\/clases/);
    await delay(2000);

    // 2.1 Gestión de Clases & Modal de Creación
    const nuevaClaseBtn = page.locator('button:has-text("Nueva Clase")');
    if (await nuevaClaseBtn.isVisible()) {
      await nuevaClaseBtn.click();
      await delay(2000);
      const closeBtn = page.locator('button:has-text("Cancelar")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await delay(1000);
      }
    }

    // 2.2 Pase de Lista (Check-In)
    await page.click('a[href="/teacher/check-in"]');
    await page.waitForURL(/\/teacher\/check-in/);
    await delay(2500);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await delay(2000);
  });

  test('3. Recorrido Promocional - Rol Administrador', async ({ page }) => {
    test.setTimeout(60000);

    console.log('🎬 Grabando Escena 3: Administrador...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await delay(1500);

    // Login Admin
    await page.fill('input[type="email"]', 'admin@treino.com');
    await delay(600);
    await page.fill('input[type="password"]', 'admin123');
    await delay(800);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    await delay(2500);

    // 3.1 Sedes
    await page.click('a[href="/admin/sedes"]');
    await page.waitForURL(/\/admin\/sedes/);
    await delay(2000);

    // 3.2 Usuarios & Créditos
    await page.click('a[href="/admin/usuarios"]');
    await page.waitForURL(/\/admin\/usuarios/);
    await delay(2000);

    // Asignar créditos modal
    const asignarBtn = page.locator('button:has-text("Asignar Créditos")').first();
    if (await asignarBtn.isVisible()) {
      await asignarBtn.click();
      await delay(2000);
      const cancelBtn = page.locator('button:has-text("Cancelar")').first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await delay(1000);
      }
    }

    // Dashboard Final
    await page.click('a[href="/admin"]');
    await page.waitForURL(/\/admin/);
    await delay(3000);
  });
});
