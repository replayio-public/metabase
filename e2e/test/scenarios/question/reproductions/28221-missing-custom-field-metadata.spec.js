import { restore } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PRODUCTS, ORDERS_ID, ORDERS } = SAMPLE_DATABASE;


test.describe("issue 28221", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should be able to select see notebook view even if a question custom field metadata is missing#27462", async ({ page }) => {
    const questionName = "Reproduce 28221";
    const customFieldName = "Non-existing field";
    const questionDetails = {
      name: questionName,
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
        expressions: {
          [customFieldName]: ["field", 9999, null],
        },
      },
    };

    const questionId = await createQuestion(page, questionDetails);

    await page.goto(`/question/${questionId}/notebook`);

    await expect(page.locator(`[displayvalue="${questionName}"]`)).toBeVisible();

    await expect(page.locator(`:text("${customFieldName}")`)).toBeVisible();
  });
});

