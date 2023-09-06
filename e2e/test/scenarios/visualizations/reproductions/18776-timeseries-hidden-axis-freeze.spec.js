import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const questionDetails = {
  dataset_query: {
    type: "native",
    native: {
      query: `
select 101002 as "id", 1 as "rate"
union all select 103017, 2
union all select 210002, 3`,
    },
    database: SAMPLE_DB_ID,
  },
  display: "bar",
  visualization_settings: {
    "graph.dimensions": ["id"],
    "graph.metrics": ["rate"],
    "graph.x_axis.axis_enabled": false,
  },
};


test.describe("issue 18776", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should not freeze when opening a timeseries chart with sparse data and without the X-axis", async ({ page }) => {
    visitQuestionAdhoc(questionDetails);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=Visualization')).toBeVisible();
  });
});
