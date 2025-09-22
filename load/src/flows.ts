import type { Page } from '@playwright/test';

// Pausa aleatoria entre acciones para simular "tiempo de pensamiento"
async function think(page: Page, minMs = 300, maxMs = 1200) {
  const wait = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await page.waitForTimeout(wait);
}

/**
 * Flujo básico demo (the-internet.herokuapp.com):
 *  1) Visita /login
 *  2) llena usuario/clave
 *  3) valida mensaje (éxito o al menos presencia de .flash)
 *  4) si hay éxito, navega a /secure y hace logout
 *  Notas:
 *   - No lanzamos error por detalles menores; registramos y seguimos (soft-fail).
 *   - Subimos timeouts para CI.
 */
export async function flujoBasico(page: Page) {
  // Aumentar tolerancia a latencia en demo sites
  page.setDefaultTimeout(15000);

  try {
    // 1) Ir al login demo
    await page.goto('/login');

    // 2) Campos
    await page.waitForSelector('#username');
    await think(page);
    await page.fill('#username', 'tomsmith');

    await think(page);
    await page.fill('#password', 'SuperSecretPassword!');

    // 3) Enviar
    await think(page);
    await page.click('button[type="submit"]');

    // 4) Validar "éxito" o al menos presencia de banner flash (éxito/fracaso)
    await page.waitForSelector('.flash', { timeout: 10000 }).catch(() => {});
    const flash = page.locator('.flash');
    const flashText = (await flash.count())
      ? (await flash.first().innerText()).trim()
      : '';

    // 5) Si entró ok, /secure debería estar disponible; si no, no fallamos
    if (flashText.includes('You logged into a secure area!')) {
      await think(page, 500, 1500);
      await page.goto('/secure');
      await page.waitForSelector('a.button', { timeout: 10000 }).catch(() => {});
      const logoutBtn = page.locator('a.button').first();
      if (await logoutBtn.count()) {
        await think(page);
        await logoutBtn.click();
        await page.waitForSelector('#username', { timeout: 10000 }).catch(() => {});
      }
    } else {
      console.log('[INFO] Login no confirmado. Mensaje flash:', flashText || '(sin flash)');
    }
  } catch (err) {
    console.log('[WARN] Error en flujoBasico:', (err as Error).message);
  }
}
