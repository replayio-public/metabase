import { restore } from "e2e/support/helpers";


test.describe("scenarios > browse data", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await signInAsAdmin(context);
  });

  test("basic UI flow should work", async ({ page }) => {
    await page.goto("/");
    await page.locator(/Browse data/).click();
    await expect(page.locator("pathname")).toEqual("/browse");
    await page.locator(/^Our data$/i);
    await page.locator("Sample Database").click();
    await page.locator("Products").click();
    await page.locator("Rustic Paper Wallet");
  });
});
