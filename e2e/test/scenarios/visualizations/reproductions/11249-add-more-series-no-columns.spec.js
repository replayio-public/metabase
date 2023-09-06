import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "13960",
  display: "line",
  dataset_query: {
    type: "query",
    database: 1,
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"], ["avg", ["field", ORDERS.TOTAL, null]]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
    },
  },
  visualization_settings: {
    "graph.dimensions": ["CREATED_AT"],
    "graph.metrics": ["avg"],
  },
};


test.describe("issue 11249", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should not allow adding more series when all columns are used (metabase#11249)", async ({ page }) => {
    visitQuestionAdhoc(questionDetails);

    await page.locator('[data-testid="viz-settings-button"]').click();

    await page.locator('[data-testid="sidebar-left"]').within(async () => {
      await page.locator('text="Data"').click();
      await expect(page.locator('text="Count"')).not.toBeVisible();

      await page.locator('text="Add another series"').click();
      await expect(page.locator('text="Count"')).toBeVisible();
      await expect(page.locator('text="Add another series"')).not.toBeVisible();
    });
  });
});

