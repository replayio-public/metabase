import { restore, visitQuestionAdhoc, openNotebook } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  display: "table",
  dataset_query: {
    database: SAMPLE_DB_ID,
    query: {
      "source-table": ORDERS_ID,
      joins: [
        {
          fields: [["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }]],
          "source-table": PRODUCTS_ID,
          condition: [
            "=",
            ["field", ORDERS.PRODUCT_ID, null],
            ["field", PRODUCTS.ID, { "join-alias": "Products" }],
          ],
          alias: "Products",
        },
      ],
      fields: [
        ["field", ORDERS.ID, null],
        ["field", ORDERS.PRODUCT_ID, null],
      ],
    },
    type: "query",
  },
};


test.describe("issue 23023", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should show only selected columns in a step preview (metabase#23023)", async ({ page }) => {
    visitQuestionAdhoc(questionDetails);

    openNotebook();

    await page.locator('.Icon[name="play"]').nth(1).click();

    await expect(page.locator('[data-testid="header-cell"]').withText("Products → Category")).toBeVisible();
    await expect(page.locator('[data-testid="header-cell"]').withText("Tax")).toBeHidden();
  });
});

