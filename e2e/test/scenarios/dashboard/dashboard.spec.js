import {
  popover,
  restore,
  selectDashboardFilter,
  editDashboard,
  showDashboardCardActions,
  filterWidget,
  sidebar,
  modal,
  openNewCollectionItemFlowFor,
  visitDashboard,
  appBar,
  rightSidebar,
  getDashboardCardMenu,
  addOrUpdateDashboardCard,
  openQuestionsSidebar,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;

async function saveDashboard() {
  await page.click('text="Save"');
  await page.waitForSelector('text="You\'re editing this dashboard."', { state: 'detached' });
}

test.describe('scenarios > dashboard', () => {
  test.beforeEach(async () => {
    await restore();
    await signInAsAdmin();
  });

  test('should create new dashboard and navigate to it from the nav bar and from the root collection (metabase#20638)', async ({ page }) => {
    await page.goto('/');
    await page.click('text="New"');
    await page.click('text="Dashboard"');

    await createDashboardUsingUI('Dash A', 'Desc A');

    await page.waitForSelector('text="This dashboard is looking empty."');
    await page.waitForSelector('text="You\'re editing this dashboard."');

    await page.goto('/collection/root?type=dashboard');
    await page.waitForSelector('text="This dashboard is looking empty."', { state: 'detached' });
    await page.waitForSelector('text="Dash A"');

    await openNewCollectionItemFlowFor('dashboard');

    await createDashboardUsingUI('Dash B', 'Desc B');

    await page.waitForSelector('text="This dashboard is looking empty."');
    await page.waitForSelector('text="You\'re editing this dashboard."');
  });

  // Other tests...
});

async function checkOptionsForFilter(filter) {
  await page.click(`text="Available filters"`);
  await page.click(`text="${filter}"`);
  await expect(page.locator('.Popover')).toContainText('Columns');
  await expect(page.locator('.Popover')).toContainText('COUNT(*)');
  await expect(page.locator('.Popover')).not.toContainText('Dashboard filters');

  await page.click('text="Pick one or more filters to update"');
}

async function assertScrollBarExists() {
  const bodyWidth = await page.evaluate(() => document.body.getBoundingClientRect().width);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  expect(innerWidth).toBeGreaterThanOrEqual(bodyWidth);
}

async function createDashboardUsingUI(name, description) {
  await page.waitForResponse('POST', '/api/dashboard');
  await page.locator('.Modal').within(async () => {
    await page.waitForSelector('text="Our analytics"');
    await page.fill('input[aria-label="Name"]', name);
    await page.fill('input[aria-label="Description"]', description);
    await page.click('text="Create"');
  });
  const dashboardId = await page.url().split('/').pop();
  return dashboardId;
}
