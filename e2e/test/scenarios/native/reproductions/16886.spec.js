import { restore, openNativeEditor } from "e2e/support/helpers";

const ORIGINAL_QUERY = "select 1 from orders";
const SELECTED_TEXT = "select 1";

const moveCursorToBeginning = "{selectall}{leftarrow}";
const highlightSelectedText = "{shift}{rightarrow}".repeat(
  SELECTED_TEXT.length,
);


test.describe("issue 16886", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test(`shouldn't remove parts of the query when choosing "Run selected text" (metabase#16886)`, async ({ page }) => {
    await openNativeEditor().type(
      ORIGINAL_QUERY + moveCursorToBeginning + highlightSelectedText,
      { delay: 50 },
    );

    await page.locator(".NativeQueryEditor .Icon-play").click();

    await expect(page.locator(".ScalarValue").textContent()).toEqual("1");

    await page.locator("@editor").locator(ORIGINAL_QUERY);
  });
});

