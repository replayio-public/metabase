import { restore, setupSMTP, sidebar } from "e2e/support/helpers";
import { modal } from "e2e/support/helpers/e2e-ui-elements-helpers";

import { USERS } from "e2e/support/cypress_data";
const { nocollection } = USERS;


test.describe("issue 22473", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    setupSMTP();
  });

  test("nocollection user should be able to view and unsubscribe themselves from a subscription", async ({ page }) => {
    await page.goto(`/dashboard/1`);
    await page.locator('icon[data-testid="subscription"]').click();
    await page.locator('text="Email it"').click();
    await page.locator('input[placeholder="Enter user names or email addresses"]')
      .click()
      .type(`${nocollection.first_name} ${nocollection.last_name}{enter}`)
      .blur();
    await sidebar().within(() => {
      page.locator('button:text("Done")').click();
    });

    await signIn("nocollection", page);
    await page.goto("/account/notifications");

    await expect(page.locator('text="Orders in a dashboard"')).toBeVisible();
    await page.locator('[data-testid="notifications-list"]').within(() => {
      page.locator('label[aria-label="close icon"]').click();
    });
    await modal().within(() => {
      page.locator('button:text("Unsubscribe")').click();
    });
    await expect(page.locator('text="Orders in a dashboard"')).not.toBeVisible();
  });
});

