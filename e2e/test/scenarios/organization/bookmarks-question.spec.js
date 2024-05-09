import {
  restore,
  navigationSidebar,
  openQuestionActions,
  openNavigationSidebar,
  visitQuestion,
} from "e2e/support/helpers";
import { getSidebarSectionTitle as getSectionTitle } from "e2e/support/helpers/e2e-collection-helpers";

test.describe("scenarios > question > bookmarks", () => {
  test.beforeEach(async () => {
    restore();
    test.intercept("/api/bookmark/card/*").as("toggleBookmark");
    test.signInAsAdmin();
  });

  test('should add, update bookmark name when question name is updated, then remove bookmark from question page', async ({ page }) => {
    await visitQuestion(1);
    await toggleBookmark();

    await openNavigationSidebar();
    await navigationSidebar().within(() => {
      getSectionTitle(/Bookmarks/);
      page.locator('text=Orders');
    });

    // Rename bookmarked question
    await page.locator('[data-testid="saved-question-header-title"]').click().type(" 2").blur();

    await navigationSidebar().within(() => {
      page.locator('text=Orders 2');
    });

    // Convert to model
    await openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Turn into a model').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Turn this into a model').click();

    await navigationSidebar().within(() => {
      page.locator('icon=model');
    });

    // Convert back to question
    await openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Turn back to saved question').click();

    await navigationSidebar().within(() => {
      page.locator('icon=model').should("not.exist");
    });

    // Remove bookmark
    await toggleBookmark();

    await navigationSidebar().within(() => {
      getSectionTitle(/Bookmarks/).should("not.exist");
      page.locator('text=Orders 2').should("not.exist");
    });
  });
});

async function toggleBookmark() {
  await page.locator('[data-testid="qb-header-action-panel"]').within(() => {
    page.locator('icon=bookmark').click();
  });
  await test.waitForResponse("@toggleBookmark");
}
