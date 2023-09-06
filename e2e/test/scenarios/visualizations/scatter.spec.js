import { restore, visitQuestionAdhoc, popover } from "e2e/support/helpers";

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


test.describe("scenarios > visualizations > scatter", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("should show correct labels in tooltip (metabase#15150)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "scatter",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT"],
        "graph.metrics": ["count", "count_2"],
      },
    });

    triggerPopoverForBubble();
    popover().within(() => {
      cy.findByText("Created At:");
      cy.findByText("Count:");
      cy.findByText(/Distinct values of Products? → ID:/);
    });
  });

  test("should show correct labels in tooltip when display name has manually set (metabase#11395)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "scatter",
      visualization_settings: {
        "graph.dimensions": ["CREATED_AT"],
        "graph.metrics": ["count", "count_2"],
        series_settings: {
          count: {
            title: "Orders count",
          },
          count_2: {
            title: "Products count",
          },
        },
      },
    });

    triggerPopoverForBubble();
    popover().within(() => {
      cy.findByText("Created At:");
      cy.findByText("Orders count:");
      cy.findByText("Products count:");
    });
  });

  test("should not display data points even when enabled in settings (metabase#13247)", async ({ page }) => {
    visitQuestionAdhoc({
      display: "scatter",
      dataset_query: testQuery,
      visualization_settings: {
        "graph.metrics": ["count"],
        "graph.dimensions": ["CREATED_AT"],
        "graph.show_values": true,
      },
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Visualization");
    cy.findAllByText("79").should("not.exist");
  });

  test("should respect circle size in a visualization (metabase#22929)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "native",
        native: {
          query: `select 1 as size, 1 as x, 5 as y union all
select 10 as size, 2 as x, 5 as y`,
        },
        database: SAMPLE_DB_ID,
      },
      display: "scatter",
      visualization_settings: {
        "scatter.bubble": "SIZE",
        "graph.dimensions": ["X"],
        "graph.metrics": ["Y"],
      },
    });

    cy.get("circle").each((circle, index) => {
      cy.wrap(circle)
        .invoke("attr", "r")
        .then(r => {
          const rFloat = +r;

          expect(rFloat).to.be.greaterThan(0);

          cy.wrap(r).as("radius" + index);
        });
    });

    cy.get("@radius0").then(r0 => {
      cy.get("@radius1").then(r1 => {
        assert.notEqual(r0, r1);
      });
    });
  });
});



async function triggerPopoverForBubble(index = 13) {
  // Hack that is needed because of the flakiness caused by adding throttle to the ExplicitSize component
  // See: https://github.com/metabase/metabase/pull/15235
  await page.locator('[data-testid="view-footer"]').within(() => {
    await page.locator('[aria-label="Switch to data"]').click(); // Switch to the tabular view...
    await page.locator('[aria-label="Switch to visualization"]').click(); // ... and then back to the scatter visualization (that now seems to be stable enough to make assertions about)
  });

  await page.locator('.bubble')
    .nth(index) // Random bubble
    .dispatchEvent("mousemove");
}

