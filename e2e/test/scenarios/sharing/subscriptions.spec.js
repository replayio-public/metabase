import {
  restore,
  setupSMTP,
  describeEE,
  popover,
  sidebar,
  mockSlackConfigured,
  isOSS,
  visitDashboard,
  sendEmailAndAssert,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const { admin } = USERS;

test.describe("scenarios > dashboard > subscriptions", () => {
  beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test.skip("should not allow sharing if there are no dashboard cards", async ({ page }) => {
    const DASHBOARD_ID = await createDashboard(page);
    visitDashboard(page, DASHBOARD_ID);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=This dashboard is looking empty.")).toBeVisible();

    await expect(page.locator('a:has([aria-label="share"])')).toHaveAttribute("aria-disabled", "true");
    await page.locator('a:has([aria-label="share"])').click();

    await expect(page.locator('[aria-label="subscription"]')).not.toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=/Share this dashboard with people *./i")).not.toBeVisible();
  });

  test("should allow sharing if dashboard contains only text cards (metabase#15077)", async ({ page }) => {
    const DASHBOARD_ID = await createDashboard(page);
    visitDashboard(page, DASHBOARD_ID);
    await page.locator('[aria-label="pencil"]').click();
    await page.locator('[aria-label="string"]').click();
    await page.locator('textarea[placeholder="You can use Markdown here, and include variables {{like_this}}"]').click().type("Foo");
    await page.locator('button:text("Save")').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=You're editing this dashboard.")).not.toBeVisible();
    await page.locator('a:has([aria-label="share"])').click();

    // Ensure clicking share icon opens sharing and embedding modal directly,
    // without a menu with sharing and dashboard subscription options.
    // Dashboard subscriptions are not shown because
    // getting notifications with static text-only cards doesn't make a lot of sense
    await expect(page.locator('[aria-label="subscription"]')).not.toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=/Share this dashboard with people *./i")).toBeVisible();
  });

  // ... other tests ...

});

// Helper functions
async function openDashboardSubscriptions(page, dashboard_id = 1) {
  // Orders in a dashboard
  await visitDashboard(page, dashboard_id);
  await page.locator('[aria-label="subscription"]').click();
}

async function assignRecipient({ page, user = admin, dashboard_id = 1 } = {}) {
  await openDashboardSubscriptions(page, dashboard_id);
  await page.locator('text="Email it"').click();
  await page.locator('input[placeholder="Enter user names or email addresses"]')
    .click()
    .type(`${user.first_name} ${user.last_name}{enter}`)
    .blur(); // blur is needed to close the popover
}

async function clickButton(page, button_name) {
  await expect(page.locator(`text=${button_name}`).closest(".Button")).not.toBeDisabled();
  await page.locator(`text=${button_name}`).closest(".Button").click();
}

function createEmailSubscription() {
  assignRecipient();
  clickButton("Done");
}

async function addParametersToDashboard(page) {
  // edit dashboard
  await page.locator('[aria-label="pencil"]').click();

  // add Category > Dropdown "Name" filter
  await page.locator('[aria-label="filter"]').click();
  await page.locator('text="Text or Category"').click();
  await page.locator('text="Is"').click();

  await page.locator('text="Select…"').click();
  await page.locator('text="Name"').click();

  // add default value to the above filter
  await page.locator('text="No default"').click();
  await page.locator('input').type("Corbin");
  await page.locator('text="Corbin Mertz"').click();
  await page.locator('text="Add filter"').click();

  // add Category > Dropdown "Category" filter
  await page.locator('[aria-label="filter"]').click();
  await page.locator('text="Text or Category"').click();
  await page.locator('text="Is"').click();
  await page.locator('text="Select…"').click();
  await page.locator('text="Category"').click();

  await page.locator('text="Save"').click();
  // wait for dashboard to save
  await expect(page.locator("text=You're editing this dashboard.")).not.toBeVisible();
}
