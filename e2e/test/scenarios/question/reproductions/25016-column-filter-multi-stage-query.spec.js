import { popover, restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  display: "table",
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-query": {
        "source-table": PRODUCTS_ID,
        aggregation: [["count"]],
        breakout: [
          ["field", PRODUCTS.CREATED_AT, { "temporal-unit": "month" }],
          ["field", PRODUCTS.CATEGORY, null],
        ],
      },
      aggregation: [["count"]],
      breakout: [["field", "CATEGORY", { "base-type": "type/Text" }]],
    },
  },
  visualization_settings: {
    "table.pivot_column": "CATEGORY",
    "table.cell_column": "count",
  },
};


test.describe("issue 25016", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test("should be possible to filter by a column in a multi-stage query (metabase#25016)", async ({ page }) => {
    visitQuestionAdhoc(questionDetails);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Category').click();

    popover().within(() => {
      page.locator('text=Filter by this column').click();
      page.locator('text=Gadget').click();
      page.locator('text=Add filter').click();
    });

    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=Showing 1 row')).toBeVisible();
  });
});
