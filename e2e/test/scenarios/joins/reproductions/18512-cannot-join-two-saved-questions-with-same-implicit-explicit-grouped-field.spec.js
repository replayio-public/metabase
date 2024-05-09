import {
  restore,
  popover,
  visualize,
  startNewQuestion,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID, REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

const question1 = getQuestionDetails("18512#1", "Doohickey");
const question2 = getQuestionDetails("18512#2", "Gizmo");


test.describe("issue 18512", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset");
    await restore();
    await signInAsAdmin();
  });

  test("should join two saved questions with the same implicit/explicit grouped field (metabase#18512)", async ({ page }) => {
    await intercept("/api/table/card__*/query_metadata");

    await createQuestion(question1);
    await createQuestion(question2);

    await startNewQuestion();
    await page.locator('text="Saved Questions"').click();

    await page.locator('text="18512#1"').click();
    await waitFor("@cardQueryMetadata");

    await page.locator('icon="join_left_outer"').click();

    await popover().within(async () => {
      await page.locator('text="Saved Questions"').click();
      await page.locator('text="18512#2"').click();
      await waitFor("@cardQueryMetadata");
    });

    await popover().findByText("Products → Created At").click();
    await popover().findByText("Products → Created At").click();

    await visualize(response => {
      expect(response.body.error).to.not.exist;
    });

    await page.locator('text="Products → Created At"');
  });
});


function getQuestionDetails(name, catFilter) {
  return {
    name,
    query: {
      "source-table": REVIEWS_ID,
      joins: [
        {
          fields: "all",
          "source-table": PRODUCTS_ID,
          condition: [
            "=",
            ["field", REVIEWS.PRODUCT_ID, null],
            ["field", PRODUCTS.ID, { "join-alias": "Products" }],
          ],
          alias: "Products",
        },
      ],
      filter: [
        "=",
        ["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }],
        catFilter,
      ],
      aggregation: [
        ["distinct", ["field", PRODUCTS.ID, { "join-alias": "Products" }]],
      ],
      breakout: [
        [
          "field",
          PRODUCTS.CREATED_AT,
          { "join-alias": "Products", "temporal-unit": "month" },
        ],
      ],
    },
  };
}
