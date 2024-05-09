import {
  popover,
  restore,
  visitQuestionAdhoc,
  getFullName,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID, USERS, USER_GROUPS } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ALL_USERS_GROUP } = USER_GROUPS;
const { PEOPLE_ID } = SAMPLE_DATABASE;
const { nocollection } = USERS;


test.describe("issue 23981", () => {
  test.beforeEach(async () => {
    // Add necessary intercepts and actions here

    restore();
    cy.signInAsAdmin();

    // Let's revoke access to "Our analytics" from "All users"
    cy.updateCollectionGraph({
      [ALL_USERS_GROUP]: { root: "none" },
    });

    cy.signIn("nocollection");
  });

  test('should not show the root collection name in breadcrumbs if the user does not have access to it (metabase#23981)', async ({ page }) => {
    visitQuestionAdhoc({
      name: "23981",
      dataset_query: {
        database: SAMPLE_DB_ID,
        type: "query",
        query: {
          "source-table": PEOPLE_ID,
        },
      },
    });

    // Replace the following lines with Playwright actions
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Save').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${getFullName(nocollection)}'s Personal Collection`).click();

    await popover().within(async () => {
      await expect(page.locator('text=Our analytics')).not.toBeVisible();
      await expect(page.locator('text=Collections')).toBeVisible();
    });
  });
});

