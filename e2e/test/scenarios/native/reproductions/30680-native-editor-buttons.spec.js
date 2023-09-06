import { restore, runNativeQuery } from "e2e/support/helpers";


test.describe("issue 30680", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should not render native editor buttons when 'Metadata' tab is open", async ({ page }) => {
    await page.goto("/model/new");

    await page.locator('[data-testid="new-model-options"]')
      .locator("text=Use a native query")
      .click();

    await page.locator('.ace_editor').type("select * from orders ");
    runNativeQuery();

    await page.locator('[data-testid="editor-tabs-metadata-name"]').click();

    await expect(page.locator('[data-testid="native-query-editor-sidebar"]')).not.toBeVisible();
  });
});
