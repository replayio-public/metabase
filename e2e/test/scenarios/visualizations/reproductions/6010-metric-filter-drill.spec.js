import { restore, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("issue 6010", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
    test.intercept("POST", "/api/dataset").as("dataset");
  });

  test('should apply the filter from a metric when drilling through (metabase#6010)', async () => {
    createMetric()
      .then(({ body: { id } }) => createQuestion(id))
      .then(({ body: { id } }) => visitQuestion(id));

    await page.locator(".dot").nth(0).click({ force: true });
    await page.locator(/See these Orders/).click();
    await test.waitForResponse("@dataset");

    await expect(page.locator("Created At is January, 2018")).toBeVisible();
    await expect(page.locator("Total is greater than 150")).toBeVisible();
  });
});

const createMetric = () => {
  return cy.request("POST", "/api/metric", {
    name: "Metric",
    description: "Metric with a filter",
    table_id: ORDERS_ID,
    definition: {
      "source-table": ORDERS_ID,
      filter: [">", ORDERS.TOTAL, 150],
      aggregation: [["count"]],
    },
  });
};

const createQuestion = metric_id => {
  return cy.createQuestion({
    name: "Question",
    display: "line",
    query: {
      "source-table": ORDERS_ID,
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
      aggregation: [["metric", metric_id]],
    },
    visualization_settings: {
      "graph.dimensions": ["CREATED_AT"],
      "graph.metrics": ["count"],
    },
  });
};
