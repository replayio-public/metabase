import { restore, openProductsTable } from "e2e/support/helpers";


test.describe("issue 24664", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
    openProductsTable({ limit: 3 });
  });

  test("should be possible to create multiple filter that start with the same value (metabase#24664)", async ({ page }) => {
    await page.locator(':text("Category")').click();
    await page.locator(':text("Filter by this column")').click();
    await page.locator('[data-testid="Doohickey-filter-value"]').click();
    await page.locator(':text("Add filter")').click();

    await page.locator(':text("Category")').click();
    await page.locator(':text("Filter by this column")').click();
    await page.locator('[data-testid="Gizmo-filter-value"]').click();
    await page.locator(':text("Add filter")').click();

    await page.locator(':text("Category is Gizmo")').click();
    await page.locator('[data-testid="Widget-filter-value"]').click();
    await page.locator(':text("Update filter")').click();

    // First filter is still there
    await page.locator(':text("Category is Doohickey")');
  });
});
