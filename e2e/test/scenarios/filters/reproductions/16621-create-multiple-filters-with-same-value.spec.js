import { restore, openProductsTable } from "e2e/support/helpers";


test.describe("issue 16661", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await openProductsTable({ limit: 3, page });
  });

  test("should be possible to create multiple filter that start with the same value (metabase#16621)", async ({ page }) => {
    await page.locator(':text("Category")').click();
    await page.locator(':text("Filter by this column")').click();
    await page.locator('[placeholder="Search the list"]').type("Doo{enter}");
    await page.locator('@Doo-filter-value').click();
    await page.locator('button:text("Add filter")').click();
    await page.locator(':text("Category is Doo")').click();
    await page.locator('@Doohickey-filter-value').click();
    await page.locator('button:text("Update filter")').click();
    await page.locator(':text("Category is 2 selections")');
  });
});

