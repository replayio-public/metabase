import {
  editDashboard,
  getDashboardCard,
  restore,
  showDashboardCardActions,
} from "e2e/support/helpers";


test.describe("issue 21830", () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    await restore();
    await signInAsAdmin();
  });

  test("slow loading card visualization options click shouldn't lead to error (metabase#21830)", async ({ page }) => {
    await page.route("GET", "/api/dashboard/*");
    await page.route(
      {
        method: "POST",
        url: "/api/dashboard/*/dashcard/*/card/*/query",
      },
      (route, request) => {
        setTimeout(() => {
          route.continue();
        }, 100);
      },
    );

    await page.goto("/dashboard/1");

    // it's crucial that we try to click on this icon BEFORE we wait for the `getCardQuery` response!
    await editDashboard();
    await showDashboardCardActions();

    await getDashboardCard().within(async () => {
      await expect(page.locator('icon[name="close"]')).toBeVisible();
      await expect(page.locator('icon[name="click"]')).not.toBeVisible();
      await expect(page.locator('icon[name="palette"]')).not.toBeVisible();
    });

    await page.waitForResponse("/api/dashboard/*/dashcard/*/card/*/query");

    await getDashboardCard().within(async () => {
      await expect(page.locator('icon[name="close"]')).toBeVisible();
      await expect(page.locator('icon[name="click"]')).toBeVisible();
      await expect(page.locator('icon[name="palette"]')).toBeVisible();
    });
  });
});

