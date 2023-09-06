import {
  restore,
  visitQuestionAdhoc,
  ensureDcChartVisibility,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PEOPLE } = SAMPLE_DATABASE;

test.describe("visual tests > visualizations > line", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("with data points", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
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
      },
      display: "line",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT"],
        "graph.metrics": ["count"],
        "graph.show_values": true,
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with vertical legends", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        database: SAMPLE_DB_ID,
        type: "query",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [
            [
              "field",
              ORDERS.CREATED_AT,
              {
                "temporal-unit": "month",
              },
            ],
            [
              "field",
              PEOPLE.STATE,
              {
                "source-field": ORDERS.USER_ID,
              },
            ],
          ],
        },
      },
      display: "line",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT", "STATE"],
        "graph.metrics": ["count"],
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with vertical legends", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        database: SAMPLE_DB_ID,
        type: "query",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [
            [
              "field",
              ORDERS.CREATED_AT,
              {
                "temporal-unit": "month",
              },
            ],
            [
              "field",
              PEOPLE.STATE,
              {
                "source-field": ORDERS.USER_ID,
              },
            ],
          ],
        },
      },
      display: "line",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT", "STATE"],
        "graph.metrics": ["count"],
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with multiple series and different display types (metabase#11216)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "query",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"], ["sum", ["field", ORDERS.TOTAL, null]]],
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
      },
      display: "line",
      visualization_settings: {
        series_settings: {
          sum: {
            display: "line",
          },
          count: {
            display: "area",
          },
        },
        "graph.dimensions": ["CREATED_AT"],
        "graph.x_axis.scale": "ordinal",
        "graph.show_values": true,
        "graph.metrics": ["count", "sum"],
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with missing values and duplicate x (metabase#11076)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "native",
        native: {
          query: `
            SELECT CAST('2010-10-01' AS DATE) as d, null as v1, 1 as v2
            UNION ALL
            SELECT CAST('2010-10-01' AS DATE), 2, null
            UNION ALL
            SELECT CAST('2010-10-02' AS DATE), 3, null
            UNION ALL
            SELECT CAST('2010-10-02' AS DATE), null, 4
            UNION ALL
            SELECT CAST('2010-10-03' AS DATE), null, 5
            UNION ALL
            SELECT CAST('2010-10-03' AS DATE), 6, null
          `,
        },
        database: SAMPLE_DB_ID,
      },
      display: "line",
      visualization_settings: {
        "graph.dimensions": ["D"],
        "graph.show_values": true,
        "graph.metrics": ["V1", "V2"],
        series_settings: {
          V1: {
            "line.missing": "zero",
          },
          V2: {
            "line.missing": "none",
          },
        },
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });
});
