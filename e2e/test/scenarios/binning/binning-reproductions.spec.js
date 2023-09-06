import {
  restore,
  popover,
  visualize,
  visitQuestionAdhoc,
  changeBinningForDimension,
  getBinningButtonForDimension,
  startNewQuestion,
  summarize,
  openOrdersTable,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("binning related reproductions", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test("shouldn't render double binning options when question is based on the saved native question (metabase#16327)", async ({ page }) => {
    cy.createNativeQuestion({
      name: "16327",
      native: { query: "select * from products limit 5" },
    });

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Saved Questions").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("16327").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Pick the metric you want to see").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Count of rows").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Pick a column to group by").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText(/CREATED_AT/i).realHover();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("by minute").click({ force: true });

    // Implicit assertion - it fails if there is more than one instance of the string, which is exactly what we need for this repro
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Month");
  });

  // ... other tests

});

async function openSummarizeOptions(questionType) {
  startNewQuestion();
  cy.findByText("Saved Questions").click();
  cy.findByText("16379").click();

  if (questionType === "Simple mode") {
    visualize();
    summarize();
  }
}
