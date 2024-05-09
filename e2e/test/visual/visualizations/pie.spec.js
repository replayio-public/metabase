import { restore, visitQuestionAdhoc } from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";


test.describe("visual tests > visualizations > pie", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsNormalUser();
  });

  test("with labels", async ({ page }) => {
    const testQuery = {
      type: "native",
      native: {
        query:
          "select 1 x, 1000 y\n" +
          "union all select 2 x, 800 y\n" +
          "union all select 3 x, 600 y\n" +
          "union all select 4 x, 200 y\n" +
          "union all select 5 x, 10 y\n",
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "pie",
      visualization_settings: {
        "pie.percent_visibility": "inside",
        "pie.dimension": "X",
        "pie.metric": "Y",
      },
    });

    await page.locator('text="2,610"').first();
    // Replace `cy.createPercySnapshot()` with the appropriate Playwright command for visual testing
  });
});
