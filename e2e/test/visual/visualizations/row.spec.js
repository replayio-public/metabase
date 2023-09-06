import { restore, visitQuestionAdhoc } from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const testQuery = {
  type: "query",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
    breakout: [["field", PRODUCTS.PRICE, { binning: { strategy: "default" } }]],
  },
  database: SAMPLE_DB_ID,
};


test.describe("visual tests > visualizations > row", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("with formatted x-axis", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "row",
      displayIsLocked: true,
      visualization_settings: {
        column_settings: {
          '["name","count"]': { suffix: " items", number_style: "decimal" },
        },
      },
    });

    cy.createPercySnapshot();
  });
});

