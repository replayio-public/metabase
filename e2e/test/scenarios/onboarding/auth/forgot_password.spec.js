import { getInbox, restore, setupSMTP } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const { admin } = USERS;


test.describe("scenarios > auth > password", () => {
  test.beforeEach(async () => {
    restore();

    await signInAsAdmin();
    setupSMTP();
    await signOut();
  });

  test("should reset password via email", async ({ page }) => {
    await page.goto("/auth/forgot_password");

    await page.locator('input[aria-label="Email address"]').fill(admin.email);
    await page.locator(':text("Send password reset email")').click();
    await expect(page.locator(':text(/Check your email/)')).toBeVisible();

    const inbox = await getInbox();
    const html = inbox.body[0].html;
    await page.goto(getResetLink(html));

    await page.locator('input[aria-label="Create a password"]').fill(admin.password);
    await page.locator('input[aria-label="Confirm your password"]').fill(admin.password);
    await page.locator(':text("Save new password")').click();

    await expect(page.locator(':text("You\'ve updated your password.")')).toBeVisible();
  });

  test("should not show the app bar when previously logged in", async ({ page }) => {
    await signInAsAdmin();

    await page.goto("/auth/forgot_password");

    await expect(page.locator(':icon("gear")')).not.toBeVisible();
  });
});


const getResetLink = html => {
  const [, anchor] = html.match(/<a (.*)>/);
  const [, href] = anchor.match(/href="([^"]+)"/);
  return href;
};
