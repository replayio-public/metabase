import { onlyOn } from "@cypress/skip-test";
import {
  restore,
  popover,
  visitDashboard,
  modal,
  rightSidebar,
  appBar,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const PERMISSIONS = {
  curate: ["admin", "normal", "nodata"],
  view: ["readonly"],
  no: ["nocollection", "nosql", "none"],
};

test.describe("managing dashboard from the dashboard's edit menu", () => {
  test.beforeEach(async () => {
    restore();
  });

  Object.entries(PERMISSIONS).forEach(([permission, userGroup]) => {
    test.describe(`${permission} access`, () => {
      userGroup.forEach(user => {
        onlyOn(permission === "curate", () => {
          test.describe(`${user} user`, () => {
            test.beforeEach(async ({ page }) => {
              await signIn(page, user);
              await visitDashboard(page, 1);
              await page.locator("main header").locator("icon[icon='ellipsis']").click();
            });

            test("should be able to change title and description", async ({ page }) => {
              await page.locator('[data-testid="dashboard-name-heading"]').click().type("1").blur();
              await assertOnRequest(page, "updateDashboard");
              await assertOnRequest(page, "getDashboard");

              await page.locator("main header").locator("icon[icon='info']").click();

              await page.locator('input[placeholder="Add description"]').click().type("Foo").blur();

              await assertOnRequest(page, "updateDashboard");
              await assertOnRequest(page, "getDashboard");

              await page.reload();
              await assertOnRequest(page, "getDashboard");
              await page.locator('input[value="Orders in a dashboard1"]');
            });

            // Add other tests here
          });
        });

        // Add other permission tests here
      });
    });
  });
});

async function clickButton(page, name) {
  await page.locator(`button:has-text("${name}")`).isEnabled().click();
}

async function assertOnRequest(page, xhr_alias) {
  // Replace this function with Playwright's appropriate methods for waiting and asserting on network requests
  // You may need to use `page.waitForResponse` and `page.on` methods to handle network requests in Playwright
}
