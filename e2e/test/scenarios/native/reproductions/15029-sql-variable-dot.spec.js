import { restore, openNativeEditor } from "e2e/support/helpers";


test.describe("issue 15029", () => {
  test.beforeEach(async () => {
    restore();
    await cy.signInAsNormalUser();
  });

  test("should allow dots in the variable reference (metabase#15029)", async ({ page }) => {
    await openNativeEditor().type(
      "select * from products where RATING = {{number.of.stars}}",
      {
        parseSpecialCharSequences: false,
      },
    );

    await page.locator('text=Variable name').elementHandle().parent().locator('text=number.of.stars');
  });
});

