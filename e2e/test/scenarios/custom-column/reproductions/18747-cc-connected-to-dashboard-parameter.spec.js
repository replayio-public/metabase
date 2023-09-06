import { restore, popover, visitDashboard } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "18747",
  query: {
    "source-table": ORDERS_ID,
    expressions: {
      ["Quantity_2"]: ["field", ORDERS.QUANTITY, null],
    },
  },
};


test.describe("issue 18747", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await signInAsAdmin();

    const { id, card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails });
    await request("PUT", `/api/dashboard/${dashboard_id}`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 12,
          size_y: 8,
        },
      ],
    });
    visitDashboard(dashboard_id);
    context.dashboard_id = dashboard_id;
  });

  test("should correctly filter the table with a number parameter mapped to the custom column Quantity_2", async ({ page, context }) => {
    await addNumberParameterToDashboard(page);
    await mapParameterToCustomColumn(page);

    await page.locator("text=Save").click();
    await page.locator("text=You're editing this dashboard.").waitForElementState("hidden");

    await addValueToParameterFilter(page);

    await expect(page.locator(".CardVisualization tbody > tr")).toHaveCount(1);

    await page.reload();
    await page.locator(".LoadingSpinner").waitForElementState("hidden");

    await expect(page.locator(".CardVisualization tbody > tr")).toHaveCount(1);
  });
});



async function addNumberParameterToDashboard(page) {
  await page.locator('icon=pencil').click();
  await page.locator('icon=filter').click();
  await page.locator('text=Number').click();
  await page.locator('text=Equal to').click();
}



async function mapParameterToCustomColumn(page) {
  await page.locator('.DashCard >> text=Select…').click();
  await popover(page).locator('text=Quantity_2').click({ force: true });
}



async function addValueToParameterFilter(page) {
  await page.locator('text=Equal to').click();
  await popover(page).locator('input').fill('14');
  await popover(page).locator('text=Add filter').click();
}

