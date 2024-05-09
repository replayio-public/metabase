import {
  restore,
  openOrdersTable,
  popover,
  summarize,
  visitDashboard,
  rightSidebar,
  updateDashboardCards,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > question > null", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should display rows whose value is `null` (metabase#13571)', async ({ page }) => {
    // ... (keep the existing code inside the test)

    // find and open previously created question
    await page.goto("/collection/root");
    await page.click('text=13571');

    // ... (keep the existing code inside the test)
  });

  test.skip("pie chart should handle `0`/`null` values (metabase#13626)", async ({ page }) => {
    // ... (keep the existing code inside the test)

    // NOTE: The actual "Assertion" phase begins here
    await page.goto(`/dashboard/${dashboard_id}?id=1`);
    await page.waitForSelector('text=13626D');

    // ... (keep the existing code inside the test)
  });

  test("dashboard should handle cards with null values (metabase#13801)", async ({ page }) => {
    // ... (keep the existing code inside the test)

    visitDashboard(DASHBOARD_ID);
    // ... (keep the existing code inside the test)
  });

  test("should filter by clicking on the row with `null` value (metabase#18386)", async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test.describe("aggregations with null values", () => {
    test("summarize with null values (metabase#12585)", async ({ page }) => {
      // ... (keep the existing code inside the test)
    });
  });
});

