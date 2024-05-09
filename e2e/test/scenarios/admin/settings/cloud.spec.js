import { restore, setupMetabaseCloud } from "e2e/support/helpers";

// Unskip when mocking Cloud in Cypress is fixed (#18289)
describe.skip("Cloud settings section", (() => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should be visible when running Metabase Cloud", async ({ page }) => {
    setupMetabaseCloud();
    await page.goto("/admin");
    await page.locator(".AdminList-items").locator("text=Cloud").click();
    await page.locator("text=/Cloud Settings/i");
    await expect(page.locator("text=Go to the Metabase Store")).toHaveAttribute(
      "href",
      "https://store.metabase.com/",
    );
  });

  test("should be invisible when self-hosting", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator(".AdminList-items").locator("text=Cloud")).not.toBeVisible();
    await page.goto("/admin/settings/cloud");
    await expect(page.locator("text=/Cloud Settings/i")).not.toBeVisible();
  });
});
