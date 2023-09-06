import { restore, visitCollection, visitDashboard } from "e2e/support/helpers";


test.describe("scenarios > dashboard > duplicate", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("shallow (duplicate dashboard but not its cards)", async ({ page }) => {
    visitDashboard(1);

    await page.locator("main header").within(async () => {
      await page.locator('icon[name="ellipsis"]').click();
    });

    await page.locator(':text("Duplicate")').click();
    await page.locator(':text(\'Duplicate "Orders in a dashboard" and its questions\')');

    await page.locator('[role="checkbox"]').click();
    await page.locator(':text(\'Duplicate "Orders in a dashboard"\')');

    await page.locator('button:text("Duplicate")').click();

    await page.locator(':text("Orders in a dashboard - Duplicate")');
  });

  test("deep (duplicate dashboard and its card)", async ({ page }) => {
    visitDashboard(1);

    await page.locator("main header").within(async () => {
      await page.locator('icon[name="ellipsis"]').click();
    });

    await page.locator(':text("Duplicate")').click();

    // Change destination collection
    await page.locator('[data-testid="select-button"]').click();
    await page.locator(':text("My personal collection")').click();

    await page.locator('button:text("Duplicate")').click();

    await page.locator(':text("Orders in a dashboard - Duplicate")');

    // Duplicated dashboard and question should live in personal collection
    visitCollection(1);

    await page.locator(':text("Orders")');
    await page.locator(':text("Orders in a dashboard - Duplicate")');
  });
});

