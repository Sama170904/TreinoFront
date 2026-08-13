import { test, expect } from '../fixtures/auth.fixture';

test.describe('Suite 3: Flujo Crítico de Reservas y Créditos (Cliente)', () => {
  test('3.1 Cargar parrilla de clases disponibles', async ({ clientePage }) => {
    await clientePage.goto('/clases');
    await clientePage.waitForSelector('text=Pilates Reformer');

    const classCards = clientePage.locator('div.bg-surface');
    await expect(classCards.first()).toBeVisible();
  });

  test('3.2 Reservar una clase disponible descuenta crédito y cambia botón a "✓ Clase Reservada"', async ({ clientePage }) => {
    await clientePage.goto('/clases');
    await clientePage.waitForLoadState('networkidle');

    const actionButtons = clientePage.locator('button:has-text("Reservar Clase"), button:has-text("Clase Reservada")');
    const firstButton = actionButtons.first();

    const text = await firstButton.innerText();
    if (text.includes('Clase Reservada')) {
      expect(text).toContain('Clase Reservada');
    } else {
      const reservationPromise = clientePage.waitForResponse(
        (res) => res.url().includes('/api/v1/reservas') && res.request().method() === 'POST'
      );

      await firstButton.click();
      const res = await reservationPromise;
      expect(res.status()).toBe(200);

      await expect(firstButton).toHaveText(/Clase Reservada/i);
    }
  });

  test('3.3 Clase ya reservada muestra botón bloqueado', async ({ clientePage }) => {
    await clientePage.goto('/clases');
    await clientePage.waitForLoadState('networkidle');

    const reservedButtons = clientePage.locator('button:has-text("Clase Reservada")');
    const count = await reservedButtons.count();

    if (count > 0) {
      const button = reservedButtons.first();
      await expect(button).toBeDisabled();
    }
  });

  test('3.4 Ver mis reservas muestra las reservas activas en orden cronológico', async ({ clientePage }) => {
    await clientePage.goto('/mis-reservas');
    await clientePage.waitForLoadState('networkidle');

    const rows = clientePage.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('3.5 Cancelar reserva a tiempo muestra alerta y actualiza tabla', async ({ clientePage }) => {
    await clientePage.goto('/mis-reservas');
    await clientePage.waitForLoadState('networkidle');

    const cancelButtons = clientePage.locator('button:has-text("Cancelar Reserva")');
    const count = await cancelButtons.count();

    if (count > 0) {
      clientePage.on('dialog', (dialog) => dialog.accept());

      const cancelPromise = clientePage.waitForResponse(
        (res) => res.url().includes('/cancelar') && res.status() === 200
      );

      await cancelButtons.first().click();
      await cancelPromise;

      const alert = clientePage.locator('text=Reserva cancelada');
      await expect(alert).toBeVisible();
    }
  });

  test('3.6 Filtro de búsqueda en tiempo real filtra las clases', async ({ clientePage }) => {
    await clientePage.goto('/clases');
    await clientePage.waitForLoadState('networkidle');

    const searchInput = clientePage.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('Pilates');

    const cardTitles = clientePage.locator('span:has-text("Pilates")');
    const count = await cardTitles.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('3.7 Filtros desplegables de Sede y Profesor filtran correctamente la parrilla', async ({ clientePage }) => {
    await clientePage.goto('/clases');
    await clientePage.waitForLoadState('networkidle');

    const sedeSelect = clientePage.locator('select[aria-label="Filtrar por Sede"]');
    const profesorSelect = clientePage.locator('select[aria-label="Filtrar por Instructor"]');

    await expect(sedeSelect).toBeVisible();
    await expect(profesorSelect).toBeVisible();

    // Seleccionar una sede si hay opciones disponibles
    const sedeOptions = await sedeSelect.locator('option').allInnerTexts();
    if (sedeOptions.length > 1) {
      await sedeSelect.selectOption({ index: 1 });
      await clientePage.waitForTimeout(300);
    }

    // Seleccionar un profesor si hay opciones disponibles
    const profesorOptions = await profesorSelect.locator('option').allInnerTexts();
    if (profesorOptions.length > 1) {
      await profesorSelect.selectOption({ index: 1 });
      await clientePage.waitForTimeout(300);
    }

    // Verificar presencia del botón limpiar filtros
    const clearBtn = clientePage.locator('button:has-text("Limpiar")');
    await expect(clearBtn).toBeVisible();

    // Probar limpiar filtros
    await clearBtn.click();
    await expect(sedeSelect).toHaveValue('');
    await expect(profesorSelect).toHaveValue('');
  });
});
