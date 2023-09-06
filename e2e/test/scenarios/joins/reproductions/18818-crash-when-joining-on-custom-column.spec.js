import { restore } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;


test.describe("issue 18818", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset");
    await restore();
    await signInAsAdmin();
  });

  test("should normally open notebook editor for queries joining on custom columns (metabase#18630)", async ({ page }) => {
    await createQuestion(
      {
        query: {
          "source-table": REVIEWS_ID,
          expressions: {
            "CC Rating": ["field", REVIEWS.RATING],
          },
          joins: [
            {
              fields: "all",
              "source-table": ORDERS_ID,
              condition: [
                "=",
                ["expression", "CC Rating"],
                ["field", ORDERS.QUANTITY, { "join-alias": "Orders" }],
              ],
            },
          ],
        },
      },
      { visitQuestion: true },
    );

    await page.locator('svg[name="notebook"]').click();
    await page.locator(':text("CC Rating")').findAll();
  });
});
