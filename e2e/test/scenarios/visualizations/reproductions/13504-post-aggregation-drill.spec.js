import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "13504",
  display: "line",
  query: {
    "source-query": {
      "source-table": ORDERS_ID,
      filter: [">", ["field", ORDERS.TOTAL, null], 50],
      aggregation: [["count"]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
    },
    filter: [">", ["field", "count", { "base-type": "type/Integer" }], 100],
  },
  visualization_settings: {
    "graph.dimensions": ["CREATED_AT"],
    "graph.metrics": ["count"],
  },
};


test.describe("issue 13504", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();
    page.route("POST", "/api/dataset", { times: 1 }).as("dataset");
  });

  test("should remove post-aggregation filters from a multi-stage query (metabase#13504)", async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });

    await page.locator(".dot").nth(0).click({ force: true });
    await page.locator(':text("See these Orders")').click();
    await page.waitForResponse("@dataset");

    await expect(page.locator(':text("Total is greater than 50")')).toBeVisible();
    await expect(page.locator(':text("Created At is March, 2017")')).toBeVisible();
  });
});
