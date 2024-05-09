import { restore, popover, openOrdersTable } from "e2e/support/helpers";


test.describe("issue 17968", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");
    restore();
    await cy.signInAsAdmin();
  });

  test("shows correct table names when joining many tables (metabase#17968)", async ({ page }) => {
    openOrdersTable({ mode: "notebook" });

    await page.locator('text="Join data"').click();
    popover().findByText("Products").click();

    await page.locator('[data-testid="action-buttons"] text="Join data"').click();
    popover().findByText("Reviews").click();

    popover().within(() => {
      cy.findByText("Products").click();
      cy.findByText("ID").click();
    });

    popover().findByText("Product ID").click();

    await page.locator('[data-testid="step-join-0-1"] [data-testid="parent-dimension"] text="Products"');
  });
});
