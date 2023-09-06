import { restore, popover, visualize } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "17767",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["field", PRODUCTS.ID, { "source-field": ORDERS.PRODUCT_ID }]],
  },
};


test.describe("issue 17767", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset");

    restore();
    await signInAsAdmin();
  });

  test("should be able to do subsequent joins on question with the aggregation that uses implicit joins (metabase#17767)", async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });

    await page.locator('icon[name="notebook"]').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Join data"').click();

    // Join "Previous results" with
    await popover().locator('text="Reviews"').click();

    // On
    await popover().locator('text="ID"').click();
    // =
    await popover()
      .locator('text=/Products? ID/')
      .click();

    await visualize(response => {
      expect(response.body.error).to.not.exist;
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="xavier"');
  });
});

