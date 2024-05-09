import {
  restore,
  openProductsTable,
  openOrdersTable,
  popover,
  sidebar,
  visitQuestionAdhoc,
  visualize,
  summarize,
  visitQuestion,
  visitDashboard,
  startNewQuestion,
  addOrUpdateDashboardCard,
  addSummaryField,
} from "e2e/support/helpers";

import { USER_GROUPS, SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID, PEOPLE, PEOPLE_ID } =
  SAMPLE_DATABASE;
const { DATA_GROUP } = USER_GROUPS;

test.describe("scenarios > visualizations > drillthroughs > chart drill", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test('should allow brush date filter', async ({ page }) => {
    // ...rest of the test code
  });

  // ...rest of the tests
});

// ...rest of the code



async function hoverLineDot({ index } = {}, { page }) {
  await page.locator('.Visualization .dot').nth(index).hover();
}
