import {
  restore,
  popover,
  modal,
  describeEE,
  isOSS,
  assertPermissionTable,
  assertPermissionOptions,
  modifyPermission,
  selectSidebarItem,
  assertSidebarItems,
  isPermissionDisabled,
  visitQuestion,
  visitDashboard,
  selectPermissionRow,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID, USER_GROUPS } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;

const { ALL_USERS_GROUP, ADMIN_GROUP } = USER_GROUPS;

const COLLECTION_ACCESS_PERMISSION_INDEX = 0;

const DATA_ACCESS_PERMISSION_INDEX = 0;
const NATIVE_QUERIES_PERMISSION_INDEX = 1;

test.describe("scenarios > admin > permissions", { tags: "@OSS" }, () => {
  test.beforeEach(async () => {
    onlyOn(isOSS);

    restore();
    signInAsAdmin();
  });

  test("shows hidden tables", async ({ page }) => {
    await page.goto(`/admin/datamodel/database/${SAMPLE_DB_ID}`);
    await page.locator('svg[name="eye_crossed_out"]').nth(0).click();

    await page.goto(
      `admin/permissions/data/group/${ALL_USERS_GROUP}/database/${SAMPLE_DB_ID}`,
    );

    assertPermissionTable([
      ["Accounts", "No self-service", "No"],
      ["Analytic Events", "No self-service", "No"],
      ["Feedback", "No self-service", "No"],
      ["Invoices", "No self-service", "No"],
      ["Orders", "No self-service", "No"],
      ["People", "No self-service", "No"],
      ["Products", "No self-service", "No"],
      ["Reviews", "No self-service", "No"],
    ]);
  });

  test("should display error on failed save", async ({ page }) => {
    // revoke some permissions
    await page.goto(`/admin/permissions/data/group/${ALL_USERS_GROUP}`);
    await page.locator('svg[name="eye"]').first().click();
    await page.locator('div[role="option"]').contains("Unrestricted").click();

    // stub out the PUT and save
    await page.route("PUT", "/api/permissions/graph", (route) => {
      route.reply(500, "Server error");
    });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('button:has-text("Save changes")').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('button:has-text("Yes")').click();

    // see error modal
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('div:has-text("Server error")');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('div:has-text("There was an error saving")');
  });

  // ... other tests
});

describeEE("scenarios > admin > permissions", (() => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  // ... other tests
}););
