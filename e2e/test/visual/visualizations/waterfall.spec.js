import {
  restore,
  visitQuestionAdhoc,
  ensureDcChartVisibility,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const testQuery = {
  type: "query",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [
      [
        "field",
        ORDERS.CREATED_AT,
        {
          "temporal-unit": "year",
        },
      ],
    ],
  },
  database: SAMPLE_DB_ID,
};


test.describe("visual tests > visualizations > waterfall", () => {
  test.beforeEach(async () => {
    restore();
    signInAsNormalUser();
  });

  test("with positive and negative series", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "waterfall",
      visualization_settings: {
        "graph.show_values": true,
        "graph.dimensions": ["CREATED_AT"],
        "graph.metrics": ["count"],
      },
    });

    ensureDcChartVisibility();
    // Replace cy.createPercySnapshot() with the equivalent Playwright command for taking a snapshot
    // For example, if using Playwright's built-in screenshot functionality:
    await page.screenshot({ path: 'waterfall_snapshot.png' });
  });
});

