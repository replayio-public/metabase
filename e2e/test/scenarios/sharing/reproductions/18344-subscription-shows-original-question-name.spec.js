import {
  restore,
  editDashboard,
  saveDashboard,
  setupSMTP,
  visitDashboard,
  sendEmailAndAssert,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const {
  admin: { first_name, last_name },
} = USERS;


test.describe("issue 18344", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    setupSMTP();

    // Rename the question
    visitDashboard(1);

    editDashboard();

    // Open visualization options
    await page.locator(".Card").hover();
    await page.locator('icon[name="palette"]').click();

    await page.locator(".Modal").within(async () => {
      await page.locator('input[value="Orders"]').fill("Foo");

      await page.locator('button:text("Done")').click();
    });

    saveDashboard();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("OrdersFoo")');
  });

  test("subscription should not include original question name when it's been renamed in the dashboard (metabase#18344)", async ({ page }) => {
    // Send a test email subscription
    await page.locator('icon[name="subscription"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Email it")').click();

    await page.locator('input[placeholder="Enter user names or email addresses"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`:text("${first_name} ${last_name}")`).click();
    // Click this just to close the popover that is blocking the "Send email now" button
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("To:")').click();

    sendEmailAndAssert(email => {
      expect(email.html).to.include("OrdersFoo");
    });
  });
});

