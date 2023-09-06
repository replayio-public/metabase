import {
  restore,
  openProductsTable,
  enterCustomColumnDetails,
} from "e2e/support/helpers";


test.describe("scenarios > question > custom column > error feedback", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    openProductsTable({ mode: "notebook", page });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Custom column").click();
  });

  test("should catch non-existent field reference", async ({ page }) => {
    enterCustomColumnDetails({
      formula: "abcdef",
      name: "Non-existent",
      page,
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Unknown Field: abcdef")).toBeVisible();
  });

  test("should fail on expression validation errors", async ({ page }) => {
    enterCustomColumnDetails({
      formula: "SUBSTRING('foo', 0, 1)",
      name: "BadSubstring",
      page,
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=positive integer")).toBeVisible();
  });
});

