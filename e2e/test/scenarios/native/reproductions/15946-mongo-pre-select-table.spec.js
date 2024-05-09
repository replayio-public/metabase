import { restore, startNewQuestion } from "e2e/support/helpers";

const MONGO_DB_NAME = "QA Mongo4";


test.describe("issue 15946", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore("mongo-4");
    cy.signInAsAdmin();

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(MONGO_DB_NAME).click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("Orders").click();
  });

  test("converting a question to the native query should pre-select a table (metabase#15946)", async ({ page }) => {
    await page.locator(".QueryBuilder .Icon-sql").click();

    await page.locator(".Modal")
      .locator("Convert this question to a native query")
      .click();
    await expect(page.locator(".Modal")).not.toBeVisible();

    await expect(page.locator(".GuiBuilder-data")).toContainText(MONGO_DB_NAME);
    await expect(page.locator(".GuiBuilder-data")).toContainText("Orders");
    await expect(page.locator("aside .RunButton")).not.toBeDisabled();
  });
});

