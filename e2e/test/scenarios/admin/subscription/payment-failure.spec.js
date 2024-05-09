import { restore, mockSessionProperty } from "e2e/support/helpers";


test.describe("banner", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();
  });

  test("Show a banner when the subscription payment status is `past-due`", async ({ page, context }) => {
    mockSessionProperty("token-status", {
      status: "past-due",
      valid: false,
      trial: false,
      features: [],
    });

    await page.goto("/");
    await expect(page.locator("text=We couldn't process payment for your account.")).toBeVisible();
    await page.goto(`/admin/`);
    await expect(page.locator("text=We couldn't process payment for your account.")).toBeVisible();

    await context.signInAsNormalUser();
    await page.goto("/");
    await page.locator("header").waitForElementState("visible");
    await expect(page.locator("text=We couldn't process payment for your account.")).not.toBeVisible();
  });

  test("Show a banner when the subscription payment status is `unpaid`", async ({ page, context }) => {
    mockSessionProperty("token-status", {
      status: "unpaid",
      valid: false,
      trial: false,
      features: [],
    });

    await page.goto("/");
    await expect(page.locator("text=Pro features won’t work right now due to lack of payment.")).toBeVisible();
    await page.goto(`/admin/`);
    await expect(page.locator("text=Pro features won’t work right now due to lack of payment.")).toBeVisible();

    await context.signInAsNormalUser();
    await page.goto("/");
    await page.locator("header").waitForElementState("visible");
    await expect(page.locator("text=Pro features won’t work right now due to lack of payment.")).not.toBeVisible();
  });
});
