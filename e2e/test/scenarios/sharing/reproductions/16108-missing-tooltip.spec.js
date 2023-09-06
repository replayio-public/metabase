import { restore, visitQuestion } from "e2e/support/helpers";


test.describe("issue 16108", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should display a tooltip for CTA icons on an individual question (metabase#16108)", async ({ page }) => {
    await visitQuestion(page, 1);
    await page.locator('icon[name="download"]').hover();
    await page.locator(':text("Download full results")').isVisible();
    await page.locator('icon[name="bell"]').hover();
    await page.locator(':text("Get alerts")').isVisible();
    await page.locator('icon[name="share"]').hover();
    await page.locator(':text("Sharing")').isVisible();
  });
});
