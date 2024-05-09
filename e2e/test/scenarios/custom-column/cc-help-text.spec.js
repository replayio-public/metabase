import {
  enterCustomColumnDetails,
  restore,
  openProductsTable,
} from "e2e/support/helpers";


test.describe("scenarios > question > custom column > help text", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    openProductsTable({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Custom column").click();
  });

  test("should appear while inside a function", async ({ page }) => {
    enterCustomColumnDetails({ formula: "Lower(" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=lower(text)')).toBeVisible();
  });

  test("should appear after a field reference", async ({ page }) => {
    enterCustomColumnDetails({ formula: "Lower([Category]" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=lower(text)')).toBeVisible();
  });

  test("should not appear while outside a function", async ({ page }) => {
    enterCustomColumnDetails({ formula: "Lower([Category])" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=lower(text)')).not.toBeVisible();
  });

  test("should not appear when formula field is not in focus (metabase#15891)", async ({ page }) => {
    enterCustomColumnDetails({ formula: "rou{enter}1.5" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=round([Temperature])')).toBeVisible();

    // Click outside of formula field instead of blur
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Expression').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=round([Temperature])')).not.toBeVisible();

    // Should also work with escape key
    await page.locator('@formula').focus();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=round([Temperature])')).toBeVisible();

    await page.locator('@formula').press('Escape');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=round([Temperature])')).not.toBeVisible();
  });

  test("should not disappear when clicked on (metabase#17548)", async ({ page }) => {
    enterCustomColumnDetails({ formula: "rou{enter}" });

    // Shouldn't hide on click
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=round([Temperature])').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=round([Temperature])')).toBeVisible();
  });
});

