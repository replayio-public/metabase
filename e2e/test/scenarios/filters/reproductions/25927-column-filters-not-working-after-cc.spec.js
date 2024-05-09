import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const query = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    query: {
      "source-query": {
        "source-table": ORDERS_ID,
        aggregation: [["count"]],
        breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
      },
      expressions: {
        "Custom Count": ["field", "count", { "base-type": "type/Integer" }],
      },
    },
    type: "query",
  },
  display: "table",
};


test.describe("issue 25927", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(query);
  });

  test("column filter should work for questions with custom column (metabase#25927)", async ({ page }) => {
    await page.locator('[data-testid="header-cell"]').findByText("Created At: Month").click();
    await page.locator(':text("Filter by this column")').click();
    await page.locator(':text("Last 30 Days")').click();

    await page.waitForResponse("@dataset");

    // Click on the filter again to try updating it
    await page.locator('[data-testid="qb-filters-panel"]').findByText("Created At Previous 30 Days").click();
    await expect(page.locator('button:text("Add filter")')).toBeEnabled();
  });
});

