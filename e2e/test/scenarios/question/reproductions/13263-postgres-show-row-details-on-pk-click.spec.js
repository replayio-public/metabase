import { restore, startNewQuestion, visualize } from "e2e/support/helpers";

const PG_DB_NAME = "QA Postgres12";


test.describe("postgres > user > query", () => {
  test.beforeEach(async ({ page }) => {
    restore("postgres-12");
    cy.signInAsAdmin();

    startNewQuestion();
    await page.click(`text=${PG_DB_NAME}`);
    await page.click(`text=Orders`);
    visualize();
  });

  test("should show row details when clicked on its entity key (metabase#13263)", async ({ page }) => {
    // We're clicking on ID: 1 (the first order) => do not change!
    // It is tightly coupled to the assertion ("37.65"), which is "Subtotal" value for that order.
    await page.locator(".Table-ID").nth(0).click();

    // Wait until "doing science" spinner disappears (DOM is ready for assertions)
    await page.locator('[data-testid="loading-spinner"]').should("not.exist");

    // Assertions
    cy.log("Fails in v0.36.6");
    // This could be omitted because real test is searching for "37.65" on the page
    await expect(page.locator('text="There was a problem with your question"')).not.toBeVisible();
    await expect(page.locator('text="37.65"')).toBeVisible();
  });
});

