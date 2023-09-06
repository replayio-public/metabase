import { restore, popover, visitDashboard } from "e2e/support/helpers";


test.describe("issue 20393", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test('should show public dashboards with nested cards mapped to parameters (metabase#20393)', async ({ page }) => {
    await createDashboardWithNestedCard(page);

    // add a date parameter to the dashboard
    await page.locator('svg[name="pencil"]').click();
    await page.locator('svg[name="filter"]').click();
    await popover(page).locator(':text("Time")').click();
    await popover(page).locator(':text("All Options")').click();

    // map the date parameter to the card
    await page.locator('.DashCard').locator(':text("Select")').click();
    await popover(page).locator(':text("CREATED_AT")').click();

    // save the dashboard
    await page.locator(':text("Save")').click();

    // open the sharing modal and enable sharing
    await page.locator('svg[name="share"]').click();
    await page.locator('input[type="checkbox"]').check();

    // navigate to the public dashboard link
    const publicLink = await page.locator(':text("Public link")').locator('input').getAttribute('value');
    await page.goto(publicLink);

    // verify that the card is visible on the page
    await expect(page.locator(':text("Q2")')).toBeVisible();
  });
});



async function createDashboardWithNestedCard(page) {
  const questionId = await cy.createNativeQuestion({
    name: "Q1",
    native: { query: 'SELECT * FROM "ORDERS"', "template-tags": {} },
  });

  const dashboardId = await cy.createQuestionAndDashboard({
    questionDetails: {
      name: "Q2",
      query: { "source-table": `card__${questionId}` },
    },
    dashboardDetails: {
      name: "Q2 in a dashboard",
    },
  });

  await visitDashboard(page, dashboardId);
}

