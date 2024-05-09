import { restore, popover, visualize } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const ccName = "Custom Created At";

const questionDetails = {
  name: "18814",
  query: {
    "source-query": {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }]],
    },
    expressions: {
      [ccName]: ["field", "CREATED_AT", { "base-type": "type/DateTime" }],
    },
  },
};


test.describe("issue 18814", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails, { visitQuestion: true });
  });

  test("should be able to use a custom column in aggregation for a nested query (metabase#18814)", async ({ page }) => {
    await page.locator('icon[name="notebook"]').click();

    await page.locator('icon[name="sum"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Count of rows")').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Pick a column to group by")').click();
    popover().contains(ccName).click();

    visualize();

    await expect(page.locator(".Visualization")).toContainText("2016");
  });
});
