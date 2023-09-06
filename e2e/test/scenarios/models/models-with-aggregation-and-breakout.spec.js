import { restore } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { turnIntoModel } from "./helpers/e2e-models-helpers";
const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > models with aggregation and breakout", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/dataset").as("dataset");
    cy.intercept("PUT", "/api/card/*").as("updateCard");

    cy.createQuestion(
      {
        name: "model with aggregation & breakout",
        display: "line",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["distinct", ["field", ORDERS.PRODUCT_ID, null]]],
          breakout: [
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }],
          ],
        },
      },
      { visitQuestion: true },
    );
  });

  test("should be possible to convert a question with an aggregation and breakout into a model", async ({ page }) => {
    turnIntoModel();
    await page.waitForResponse("@updateCard");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Created At: Month");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Distinct values of Product ID");
  });
});
