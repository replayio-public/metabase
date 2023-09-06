import { restore } from "e2e/support/helpers";


test.describe("issue 21532", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();
  });

  test("should allow navigating back from admin settings (metabase#21532)", async ({ page }) => {
    await page.goto("/");

    await page.locator('svg[name="gear"]').click();
    await page.locator(':text("Admin settings")').click();
    await page.locator(':text("Getting set up")');

    await page.goBack();
    await expect(page.url()).toMatch(/\/$/);
  });
});
