import { restore, popover } from "e2e/support/helpers";
import { USER_GROUPS } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;

const url = `/admin/permissions/data/group/${ALL_USERS_GROUP}`;


test.describe("issue 20436", () => {
  test.beforeEach(async () => {
    test.intercept("PUT", "/api/permissions/graph").as("updatePermissions");

    restore();
    await test.signInAsAdmin();

    await test.updatePermissionsGraph({
      [ALL_USERS_GROUP]: {
        1: { data: { schemas: "all", native: "none" } },
      },
    });
  });

  test('should display correct permissions on the database level after changes on the table level (metabase#20436)', async ({ page }) => {
    await page.goto(url);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Unrestricted');

    // Go the the view where we can change permissions for individual tables
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Sample Database').click();

    // Change the permission levels for ANY of the tables - it doesn't matter which one
    await changePermissions("Unrestricted", "No self-service");

    await page.locator('text=Change').click();
    await saveChanges();
    await page.waitForResponse("@updatePermissions");

    // Now turn it back to the "Unrestricted" access
    await changePermissions("No self-service", "Unrestricted");

    await saveChanges();
    await page.waitForResponse("@updatePermissions");

    await page.goto(url);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Unrestricted');
  });
});



async function changePermissions(from, to) {
  await page.locator(`text=${from}`).first().click();

  await popover().locator(`text=${to}`).click();
}



async function saveChanges() {
  await page.locator('text=Save changes').click();
  await page.locator('text=Yes').click();
}

