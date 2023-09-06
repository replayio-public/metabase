import { restore } from "e2e/support/helpers";


test.describe("scenarios > about Metabase", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await page.goto("/");
    await page.locator('svg[name="gear"]').click();
    await page.locator(':text("About Metabase")').click();
  });

  test.skip("should display correct Metabase version (metabase#15656)", async ({ page }) => {
    await expect(page.locator(':text(/You\'re on version v[01](\\.\\d+){2,3}(-[\\w\\d]+)?/i)')).toBeVisible();
    await expect(page.locator(':text(/Built on \\d{4}-\\d{2}-\\d{2}/)')).toBeVisible();

    await expect(page.locator(':text("Branch: ?")')).not.toBeVisible();
    await expect(page.locator(':text("Hash: ?")')).not.toBeVisible();
  });
});
