import {
  restore,
  startNewQuestion,
  enterCustomColumnDetails,
  visualize,
  popover,
  resetTestTable,
} from "e2e/support/helpers";

["postgres", "mysql"].forEach(dialect => {
  test.describe(`issue 27745 (${dialect})`, { tags: "@external" }, () => {
    const tableName = "colors27745";

    test.beforeEach(async () => {
      restore(`${dialect}-writable`);
      cy.signInAsAdmin();

      resetTestTable({ type: dialect, table: tableName });
      cy.request("POST", "/api/database/2/sync_schema");
    });

    test('should display all summarize options if the only numeric field is a custom column (metabase#27745)', async ({ page }) => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(/Writable/i).click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(/colors/i).click();
      await page.locator('icon[name="add_data"]').click();
      enterCustomColumnDetails({
        formula: "case([ID] > 1, 25, 5)",
        name: "Numeric",
      });
      await page.locator('button:text("Done")').click();

      visualize();

      await page.locator('testId("header-cell"):text("Numeric")').click();
      popover().findByText(/^Sum$/).click();

      cy.wait("@dataset");
      cy.get(".ScalarValue").invoke("text").should("eq", "55");

      cy.findByTestId("sidebar-right")
        .should("be.visible")
        .within(() => {
          cy.findByTestId("aggregation-item").should(
            "contain",
            "Sum of Numeric",
          );
        });
    });
  });
});
