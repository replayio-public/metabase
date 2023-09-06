import {
  restore,
  navigationSidebar,
  openNavigationSidebar,
  visitDashboard,
} from "e2e/support/helpers";


test.describe("scenarios > dashboard > bookmarks", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should add, update bookmark name when dashboard name is updated, and then remove bookmark", async ({ page }) => {
    await visitDashboard(page, 1);
    await openNavigationSidebar(page);

    // Add bookmark
    await page.locator("main header").locator("text=bookmark").click();

    await navigationSidebar().locator("text=Orders in a dashboard");

    // Rename bookmarked dashboard
    await page.locator('[data-testid="dashboard-name-heading"]').click().type(" 2").blur();

    await navigationSidebar().locator("text=Orders in a dashboard 2");

    // Remove bookmark
    await page.locator("main header").locator("text=bookmark").click();

    await navigationSidebar().locator("text=Orders in a dashboard 2").should("not.exist");
  });
});

