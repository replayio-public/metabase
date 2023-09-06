import {
  enterCustomColumnDetails,
  popover,
  visualize,
  restore,
  startNewQuestion,
} from "e2e/support/helpers";

const CC_NAME = "C-States";
const PG_DB_NAME = "QA Postgres12";


test.describe("issue 13751", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore("postgres-12");
    cy.signInAsAdmin();

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(PG_DB_NAME).should("be.visible").click();
    await page.locator("People").click();
  });

  test("should allow using strings in filter based on a custom column (metabase#13751)", async ({ page }) => {
    cy.log("Create custom column using `regexextract()`");

    await page.locator("add_data").click();
    popover().within(() => {
      enterCustomColumnDetails({
        formula: 'regexextract([State], "^C[A-Z]")',
      });
      await page.locator("Something nice and descriptive").type(CC_NAME);
      await page.locator(".Button").contains("Done").should("not.be.disabled").click();
    });

    // Add filter based on custom column
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("Add filters to narrow your answer").click();
    popover().within(() => {
      await page.locator(CC_NAME).click();
      await page.locator("select-button").click();
      cy.log(
        "**It fails here already because it doesn't find any condition for strings. Only numbers.**",
      );
      await page.locator("Is");
      await page.locator("input").type("CO");
      await page.locator(".Button")
        .contains("Add filter")
        .should("not.be.disabled")
        .click();
    });

    visualize();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("Arnold Adams");
  });
});
