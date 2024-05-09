import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";


test.describe("visual tests > visualizations > funnel", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsNormalUser();
  });

  test("empty", async ({ page }) => {
    const testQuery = {
      type: "native",
      native: {
        query:
          "select 'a' col1, 0 col2 union all\n" +
          "select 'b', 0 union all\n" +
          "select 'c', 0",
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "funnel",
      visualization_settings: {
        "funnel.type": "funnel",
      },
    });

    await page.locator('[data-testid="funnel-chart"]');
    // Replace cy.createPercySnapshot() with the appropriate Playwright command for visual testing
  });

  test("normal", async ({ page }) => {
    const testQuery = {
      type: "native",
      native: {
        query:
          "select 'a' step, 1000 users union all\n" +
          "select 'b', 800 union all\n" +
          "select 'c', 400 union all\n" +
          "select 'd', 155 union all\n" +
          "select 'e', 0",
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "funnel",
      visualization_settings: {
        "funnel.type": "funnel",
      },
    });

    await page.locator('[data-testid="funnel-chart"]');
    // Replace cy.createPercySnapshot() with the appropriate Playwright command for visual testing
  });
});

