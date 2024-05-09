import {
  restore,
  enterCustomColumnDetails,
  visualize,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "20519",
  query: {
    "source-query": {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [
        ["field", PRODUCTS.CATEGORY, { "source-field": ORDERS.PRODUCT_ID }],
      ],
    },
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field", "CATEGORY", { "base-type": "type/Text" }],
          ["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }],
        ],
        alias: "Products",
      },
    ],
    limit: 2,
  },
};


test.describe("issue 20519", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await createQuestion(page, questionDetails, { visitQuestion: true });
    switchToNotebookView(page);
  });

  test("should allow subsequent joins and nested query after summarizing on the implicit joins (metabase#20519)", async ({ page }) => {
    await page.locator('.Icon-add_data').last().click();

    enterCustomColumnDetails({
      formula: "1 + 1",
      name: "Two",
    });

    await page.locator('button:text("Done")').click();

    visualize(response => {
      expect(response.body.error).not.to.exist;
    });

    await expect(page.locator(':text("Doohickey")')).toBeVisible();
    await expect(page.locator(':text("Two")')).toBeVisible();
  });
});


async function switchToNotebookView(page) {
  await page.route(`GET`, `/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`, {
    name: "publicSchema",
  });

  await page.locator('.Icon-notebook').click();
  await page.waitForResponse("@publicSchema");
}
