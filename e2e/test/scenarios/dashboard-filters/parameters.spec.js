import {
  popover,
  restore,
  visitDashboard,
  filterWidget,
  editDashboard,
  sidebar,
  getDashboardCard,
  selectDashboardFilter,
  saveDashboard,
  updateDashboardCards,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { ORDERS_ID, ORDERS, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > dashboard > parameters", () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    await restore();
    await signInAsAdmin();
  });

  // ... other tests ...

})

async function isFilterSelected(page, filter, bool) {
  const isChecked = await page.locator(`[data-testid="${filter}-filter-value"] input[type="checkbox"]`).isChecked();
  expect(isChecked).toBe(bool);
}
