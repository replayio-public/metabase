import {
  restore,
  openNavigationSidebar,
  visitDashboard,
} from "e2e/support/helpers";

const ratingFilter = {
  name: "Text",
  slug: "text",
  id: "5dfco74e",
  type: "string/=",
  sectionId: "string",
};

const paramDashboard = {
  name: "Dashboard With Params",
  parameters: [ratingFilter],
};

const regularDashboard = {
  name: "Dashboard Without Params",
};


test.describe("issue 27356", () => {
  test.beforeEach(async ({ context }) => {
    await test.fixtures().intercept("GET", "/api/dashboard/*").as("getDashboard");
    restore();
    await test.fixtures().signInAsAdmin();

    const paramDashboardId = await test.fixtures().createDashboard(paramDashboard);
    await test.fixtures().request("POST", `/api/bookmark/dashboard/${paramDashboardId}`);

    const regularDashboardId = await test.fixtures().createDashboard(regularDashboard);
    await test.fixtures().request("POST", `/api/bookmark/dashboard/${regularDashboardId}`);
    visitDashboard(regularDashboardId);
  });

  test("should seamlessly move between dashboards with or without filters without triggering an error (metabase#27356)", async ({ page }) => {
    openNavigationSidebar();

    await page.locator(`text=${paramDashboard.name}`).click();
    await page.locator('text="This dashboard is looking empty."');

    await page.locator(`text=${regularDashboard.name}`).click();
    await page.locator('text="This dashboard is looking empty."');

    await page.locator(`text=${paramDashboard.name}`).click();
    await page.locator('text="This dashboard is looking empty."');
  });
});

