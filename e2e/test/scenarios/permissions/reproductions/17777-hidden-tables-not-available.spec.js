import { restore, popover } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { USER_GROUPS, SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;

const { ORDERS_ID, PRODUCTS_ID, PEOPLE_ID, REVIEWS_ID } = SAMPLE_DATABASE;

describe.skip("issue 17777", (() => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    hideTables([ORDERS_ID, PRODUCTS_ID, PEOPLE_ID, REVIEWS_ID]);
  });

  test('should still be able to set permissions on individual tables, even though they are hidden in data model (metabase#17777)', async ({ page }) => {
    await page.goto(`/admin/permissions/data/group/${ALL_USERS_GROUP}`);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Permissions for the All Users group");
    await page.locator("text=Sample Database").click();

    await expect(page).toHaveURLPath(`/admin/permissions/data/group/${ALL_USERS_GROUP}/database/${SAMPLE_DB_ID}`);

    await page.locator('[data-testid="permission-table"]').within(() => {
      page.locator("text=Orders");
      page.locator("text=Products");
      page.locator("text=Reviews");
      page.locator("text=People");
    });

    await page.locator("text=No self-service").first().click();

    popover().contains("Unrestricted");
  });
}));

async function hideTables(tables) {
  await cy.request("PUT", "/api/table", {
    ids: tables,
    visibility_type: "hidden",
  });
}
