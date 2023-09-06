import { restore, visitDashboard } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;


test.describe("issue 27380", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset");

    restore();
    cy.signInAsAdmin();
  });

  test('should not drop fields from joined table on dashboard "zoom-in" (metabase#27380)', async ({ page }) => {
    const questionDetails = {
      query: {
        "source-table": ORDERS_ID,
        aggregation: [["count"]],
        breakout: [
          [
            "field",
            PRODUCTS.CREATED_AT,
            { "source-field": ORDERS.PRODUCT_ID, "temporal-unit": "month" },
          ],
        ],
      },
      display: "line",
    };
    cy.createQuestionAndDashboard({ questionDetails }).then(
      ({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      },
    );

    // Doesn't really matter which 'circle" we click on the graph
    await page.locator("circle").last().click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=See this month by week").click();
    await page.waitForResponse("@dataset");

    // Graph should still exist
    // Let's check only the y-axis label
    await expect(page.locator(".y-axis-label").textContent()).toEqual("Count");

    await page.locator('icon[name="notebook"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Pick a column to group by")).not.toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Product → Created At: Week");
  });
});

