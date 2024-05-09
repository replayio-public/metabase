import {
  restore,
  openOrdersTable,
  enterCustomColumnDetails,
} from "e2e/support/helpers";

// ExpressionEditorTextfield jsx component

test.describe("scenarios > question > custom column > expression editor", () => {
  test.beforeEach(async ({ page }) => {
    await restore();
    await cy.signInAsAdmin();

    // This is the default screen size but we need it explicitly set for this test because of the resize later on
    await cy.viewport(1280, 800);

    await openOrdersTable({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Custom column"').click();

    await enterCustomColumnDetails({
      formula: "1+1", // Formula was intentionally written without spaces (important for this repro)!
      name: "Math",
    });
    await page.locator('button:text("Done")').isEnabled();
  });

  test("should not accidentally delete Custom Column formula value and/or Custom Column name (metabase#15734)", async ({ page }) => {
    await page.locator('@formula')
      .click({ force: true })
      .type("{movetoend}{leftarrow}{movetostart}{rightarrow}{rightarrow}", {
        force: true,
      });
    await page.locator('input:has-text("Math")').focus();
    await page.locator('button:text("Done")').isEnabled();
  });

  test("should not erase Custom column formula and Custom column name when expression is incomplete (metabase#16126)", async ({ page }) => {
    await page.locator('@formula')
      .focus()
      .click({ force: true })
      .type("{movetoend}{backspace}", { force: true })
      .blur();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Expected expression"');
    await page.locator('button:text("Done")').isDisabled();
  });

  test("should not erase Custom Column formula and Custom Column name on window resize (metabase#16127)", async ({ page }) => {
    await cy.viewport(1260, 800);
    await page.locator('input:has-text("Math")');
    await page.locator('button:text("Done")').isEnabled();
  });
});

