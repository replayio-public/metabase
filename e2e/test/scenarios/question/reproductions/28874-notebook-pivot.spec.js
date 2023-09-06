import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "28874",
  display: "pivot",
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [
        ["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }],
        ["field", ORDERS.PRODUCT_ID, null],
      ],
    },
  },
};


test.describe("issue 28874", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("should allow to modify a pivot question in the notebook (metabase#28874)", async ({ page }) => {
    visitQuestionAdhoc(questionDetails, { mode: "notebook" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Product ID"').elementHandle().parent().locator('icon="close"').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="Product ID"')).not.toBeVisible();
  });
});

