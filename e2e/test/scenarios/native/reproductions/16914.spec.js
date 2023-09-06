import { restore, openNativeEditor, runNativeQuery } from "e2e/support/helpers";


test.describe("issue 16914", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    context.intercept("POST", "api/dataset").as("dataset");
    await signInAsAdmin();
  });

  test("should recover visualization settings after a failed query (metabase#16914)", async ({ page, context }) => {
    const FAILING_PIECE = " foo";
    const highlightSelectedText = "{shift}{leftarrow}".repeat(
      FAILING_PIECE.length,
    );

    openNativeEditor().type("SELECT 'a' as hidden, 'b' as visible");
    runNativeQuery();

    await page.locator('[data-testid="viz-settings-button"]').click();
    await page.locator('[data-testid="sidebar-left"]')
      .locator(/hidden/i)
      .siblings("[data-testid$=hide-button]")
      .click();
    await page.locator('button:text("Done")').click();

    await page.locator('@editor').type(FAILING_PIECE);
    runNativeQuery();

    await page.locator('@editor').type(
      "{movetoend}" + highlightSelectedText + "{backspace}",
    );
    runNativeQuery();

    await page.locator('.Visualization').within(() => {
      page.locator('text("Every field is hidden right now")').should("not.exist");
      page.locator('text("VISIBLE")');
      page.locator('text("HIDDEN")').should("not.exist");
    });
  });
});

