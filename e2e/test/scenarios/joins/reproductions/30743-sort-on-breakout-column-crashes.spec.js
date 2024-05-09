import {
  restore,
  visitQuestionAdhoc,
  popover,
  visualize,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const query = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      joins: [
        {
          fields: "all",
          "source-table": PRODUCTS_ID,
          condition: [
            "=",
            ["field", ORDERS.PRODUCT_ID, null],
            ["field", PRODUCTS.ID, { "join-alias": "Products" }],
          ],
          alias: "Products",
        },
      ],
      aggregation: [["count"]],
      breakout: [["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }]],
    },
  },
};


test.describe("issue 30743", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(query, { mode: "notebook" });
  });

  test("should be possible to sort on the breakout column (metabase#30743)", async ({ page }) => {
    await page.locator('label:has-text("Sort")').click();
    popover().contains("Category").click();

    visualize();
    await expect(page.locator('.bar')).toHaveCount(4);
  });
});

