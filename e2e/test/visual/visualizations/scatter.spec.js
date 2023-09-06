import {
  restore,
  visitQuestionAdhoc,
  ensureDcChartVisibility,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;

const testQuery = {
  database: SAMPLE_DB_ID,
  query: {
    "source-table": ORDERS_ID,
    aggregation: [
      ["count"],
      [
        "distinct",
        ["field", PRODUCTS.ID, { "source-field": ORDERS.PRODUCT_ID }],
      ],
    ],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  type: "query",
};


test.describe("visual tests > visualizations > scatter", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("with date dimension", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "scatter",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT"],
        "graph.metrics": ["count", "count_2"],
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with log axes", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "native",
        native: {
          query: `select 1 x, 1 y
                  union all select 10 x, 10 y
                  union all select 100 x, 100 y
                  union all select 200 x, 200 y
                  union all select 10000 x, 10000 y`,
        },
        database: SAMPLE_DB_ID,
      },
      display: "scatter",

      displayIsLocked: true,
      visualization_settings: {
        "graph.dimensions": ["X"],
        "graph.metrics": ["Y"],
        "graph.x_axis.scale": "log",
        "graph.y_axis.scale": "log",
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with negative values and various bubble sizes", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "native",
        native: {
          query: `select 1 X, 1 Y, 20 SIZE
union all select 2, 10, 10
union all select 3, -9, 6
union all select 4, 100, 30
union all select 5, -20, 70`,
        },
        database: SAMPLE_DB_ID,
      },
      display: "scatter",

      displayIsLocked: true,
      visualization_settings: {
        "scatter.bubble": "SIZE",
        "graph.dimensions": ["X"],
        "graph.metrics": ["Y"],
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });
});

