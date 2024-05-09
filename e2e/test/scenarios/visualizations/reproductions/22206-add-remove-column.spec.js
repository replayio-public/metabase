import { restore, openOrdersTable } from "e2e/support/helpers";


test.describe("#22206 adding and removing columns doesn't duplicate columns", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsNormalUser(page);
    openOrdersTable();

    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });
  });

  test('should not duplicate column in settings when removing and adding it back', async ({ page }) => {
    await page.locator('[data-testid="viz-settings-button"]').click();

    // remove column
    await page.locator('[data-testid="sidebar-content"]')
      .locator(':text("Subtotal")')
      .locator('~ .Icon-eye_outline')
      .click();

    // rerun query
    await page.locator('.RunButton').first().click();
    await page.waitForResponse('**/dataset');
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

    // add column back again
    await page.locator('[data-testid="sidebar-content"]')
      .locator(':text("Subtotal")')
      .locator('~ .Icon-add')
      .click();

    await page.waitForResponse('**/dataset');
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

    // fails because there are 2 columns, when there should be one
    await page.locator('[data-testid="sidebar-content"]').locator(':text("Subtotal")');

    // if you add it back again it crashes the question
  });
});

