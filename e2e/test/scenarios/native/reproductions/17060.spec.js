import { restore, openNativeEditor } from "e2e/support/helpers";

import { runQuery } from "../../native-filters/helpers/e2e-sql-filter-helpers";

const ORIGINAL_QUERY = `select ID as "num", CATEGORY as "text" from PRODUCTS limit 1`;
const SECTION = "select ";
const SELECTED_TEXT = "ID";

const moveCursorToBeginning = "{selectall}{leftarrow}";

const highlightSelectedText = "{shift}{rightarrow}".repeat(
  SELECTED_TEXT.length,
);

const moveCursorAfterSection = "{rightarrow}".repeat(SECTION.length);


test.describe("issue 17060", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset").as("dataset");

    restore();
    await page.signInAsAdmin();

    openNativeEditor().type(ORIGINAL_QUERY);

    runQuery();

    await page.locator('[data-testid="viz-settings-button"]').click();

    await page.locator('[data-testid="sidebar-left"]').within(() => {
      rearrangeColumns();
    });
  });

  test("should not render duplicated columns (metabase#17060)", async ({ page }) => {
    await page.locator("@editor").type(
      moveCursorToBeginning +
        moveCursorAfterSection +
        highlightSelectedText +
        "RATING",
      { delay: 50 },
    );

    runQuery();

    await page.locator(".Visualization").within(() => {
      page.locator("num");
    });
  });
});


async function rearrangeColumns(page) {
  const draggableItem = await page.locator('[data-testid="draggable-item"]').first();
  await draggableItem.dispatchEvent("mousedown", 0, 0, { force: true });
  await draggableItem.dispatchEvent("mousemove", 5, 5, { force: true });
  await draggableItem.dispatchEvent("mousemove", 0, 100, { force: true });
  await draggableItem.dispatchEvent("mouseup", 0, 100, { force: true });
}

