import type { Page } from '@playwright/test';

// Pausa aleatoria entre acciones para simular "tiempo de pensamiento"
async function think(page: Page, minMs = 300, maxMs = 1200) {
  const wait = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await page.waitForTimeout(wait);
}

/**
 * Flujo básico demo:
 *  1) Visita /login
 *  2) llena usuario/clave
 *  3) valida mensaje de éxito
 *  4) navega a /secure y luego hace logout
 */
export async function flujoBasico(page: Page) {
  // La URL base viene de "config.target" en el YAML, aquí solo rutas:
  await page.goto('/login');
  await page.waitForSelector('#username');

  await think(page);
  await page.fill('#username', 'tomsmith');

  await think(page);
  await page.fill('#password', 'SuperSecretPassword!');

  await think(page);
  await page.click('button[type="submit"]');

  // Validación de éxito
  await page.waitForSelector('.flash.success');

  // Un paso extra: navegar a /secure y hacer logout
  await think(page, 500, 1500);
  await page.goto('/secure');
  await page.waitForSelector('a.button'); // Logout button exists

  await think(page);
  const logoutBtn = page.locator('a.button').first();
  if (await logoutBtn.count()) {
    await logoutBtn.click();
  }

  // Fin: esperar que aparezca el login otra vez
  await page.waitForSelector('#username');
}
