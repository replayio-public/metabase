import {
  restore,
  popover,
  summarize,
  visualize,
  openOrdersTable,
  openPeopleTable,
  visitQuestionAdhoc,
  enterCustomColumnDetails,
  filter,
  checkExpressionEditorHelperPopoverPosition,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > question > custom column", () => {
  test.beforeEach(async () => {
    await restore();
    await cy.signInAsNormalUser();
  });

  test('can create a custom column (metabase#13241)', async ({ page }) => {
    openOrdersTable({ mode: "notebook" });
    cy.icon("add_data").click();

    enterCustomColumnDetails({ formula: "1 + 1", name: "Math" });
    cy.button("Done").click();

    visualize();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("There was a problem with your question").should("not.exist");
    cy.get(".Visualization").contains("Math");
  });

  // ... other tests ...

});

const enterDateFilter = (value, index = 0) => {
  cy.findAllByTestId("specific-date-picker")
    .eq(index)
    .findByRole("textbox")
    .clear()
    .type(value)
    .blur();
};
