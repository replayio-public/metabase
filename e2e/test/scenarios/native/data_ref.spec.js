import {
  restore,
  openNativeEditor,
  openQuestionActions,
} from "e2e/support/helpers";


test.describe("scenarios > native question > data reference sidebar", () => {
  test.beforeEach(async () => {
    restore();
    await cy.signInAsAdmin();
  });

  test("should show tables", async ({ page }) => {
    openNativeEditor();
    await page.locator('svg[name="reference"]').click();
    await page.locator("[data-testid='sidebar-header-title']").findByText(
      "Sample Database",
    );
    await page.locator(':text("ORDERS")').click();
    await page.locator(':text("Confirmed Sample Company orders for a product, from a user.")');
    await page.locator(':text("9 columns")');
    await page.locator(':text("QUANTITY")').click();
    await page.locator(':text("Number of products bought.")');
    await page.locator(':text("QUANTITY")').click();
    await page.locator(':text("ORDERS")').click();
    await page.locator("[data-testid='sidebar-header-title']")
      .findByText("Sample Database")
      .click();
    await page.locator(':text("Data Reference")');
  });

  test("should show models", async ({ page }) => {
    cy.createNativeQuestion(
      {
        name: "Native Products Model",
        description: "A model of the Products table",
        native: { query: "select id as renamed_id from products" },
        dataset: true,
      },
      { visitQuestion: true },
    );
    openQuestionActions();
    await page.locator('[data-testid="move-button"]').click();
    await page.locator(':text("My personal collection")').click();
    await page.locator(':text("Move")').click();

    openNativeEditor();
    await page.locator('svg[name="reference"]').click();
    await page.locator(':text("1 model")');
    await page.locator(':text("Native Products Model")').click();
    await page.locator(':text("A model of the Products table")');
    await page.locator(':text("Bobby Tables\'s Personal Collection")');
    await page.locator(':text("1 column")');
    await page.locator(':text("RENAMED_ID")').click();
    await page.locator(':text("No description")');
  });
});

