import {
  restore,
  setupSMTP,
  visitDashboard,
  getFullName,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const { admin } = USERS;

test.describe("issue 17658", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    cy.intercept("PUT", "/api/pulse/*").as("deletePulse");
    restore();
    cy.signInAsAdmin();

    setupSMTP();

    moveDashboardToCollection("First collection");
  });

  test('should delete dashboard subscription from any collection (metabase#17658)', async ({ page }) => {
    visitDashboard(1);

    await page.locator('svg[name="subscription"]').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=^Emailed monthly').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Delete this subscription').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=^This dashboard will no longer be emailed to').click();

    await page.locator('button:text("Delete")').click();

    cy.wait("@deletePulse").then(({ response }) => {
      expect(response.body.cause).not.to.exist;
      expect(response.statusCode).not.to.eq(500);
    });

    await expect(page.locator('button:text("Delete")')).not.toBeVisible();
  });
});

async function moveDashboardToCollection(collectionName) {
  const { first_name, last_name, email } = admin;

  cy.request("GET", "/api/collection/tree?tree=true").then(
    ({ body: collections }) => {
      const { id } = collections.find(
        collection => collection.name === collectionName,
      );

      // Move dashboard
      cy.request("PUT", "/api/dashboard/1", { collection_id: id });

      // Create subscription
      cy.request("POST", "/api/pulse", {
        name: "Orders in a dashboard",
        cards: [
          {
            id: 1,
            collection_id: null,
            description: null,
            display: "table",
            name: "Orders",
            include_csv: false,
            include_xls: false,
            dashboard_card_id: 1,
            dashboard_id: 1,
            parameter_mappings: [],
          },
        ],
        channels: [
          {
            channel_type: "email",
            enabled: true,
            recipients: [
              {
                id: 1,
                email,
                first_name,
                last_name,
                common_name: getFullName(admin),
              },
            ],
            details: {},
            schedule_type: "monthly",
            schedule_day: "mon",
            schedule_hour: 8,
            schedule_frame: "first",
          },
        ],
        skip_if_empty: false,
        collection_id: id,
        parameters: [],
        dashboard_id: 1,
      });
    },
  );
}
