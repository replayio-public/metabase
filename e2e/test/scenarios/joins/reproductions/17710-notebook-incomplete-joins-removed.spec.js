import {
  restore,
  popover,
  openOrdersTable,
  visualize,
} from "e2e/support/helpers";


test.describe("issue 17710", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");
    restore();
    cy.signInAsAdmin();
  });

  test("should remove only invalid join clauses (metabase#17710)", async ({ page }) => {
    openOrdersTable({ mode: "notebook" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Join data"').click();
    popover().findByText("Products").click();

    await page.locator('[data-testid="step-join-0-0"]').within(() => {
      page.locator('icon="add"').click();
    });

    visualize();

    await page.locator('icon="notebook"')
      .click()
      .then(() => {
        page.locator('[data-testid="step-join-0-0"]').within(() => {
          page.locator('text="ID"');
          page.locator('text="Product ID"');
        });
      });
  });
});
