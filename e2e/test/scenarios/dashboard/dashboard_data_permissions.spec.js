import {
  restore,
  popover,
  selectDashboardFilter,
  visitDashboard,
} from "e2e/support/helpers";


async function filterDashboard(page, suggests = true) {
  await visitDashboard(1);
  await page.locator("text=Orders");
  await page.locator("text=Text").click();

  // We should get a suggested response and be able to click it if we're an admin
  if (suggests) {
    await page.locator('input[placeholder="Search by Address"]').fill("Main Street");
    await page.locator("text=100 Main Street").click();
  } else {
    await page.locator('input[placeholder="Search by Address"]').fill("100 Main Street");
    await page.locator('input[placeholder="Search by Address"]').blur();
    await page.waitForResponse("@search", { status: 403 });
  }
  await page.locator("text=Add filter").click({ force: true });
  await page.locator("text=100 Main Street");
  await page.locator(/Rows \d-\d+ of 23/);
}



test.describe("support > permissions (metabase#8472)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("GET", "/api/dashboard/1/params/*/search/*", { alias: "search" });

    await restore();
    await cy.signInAsAdmin();

    // Setup a dashboard with a text filter
    await visitDashboard(1);
    // click pencil icon to edit
    await page.locator("icon=pencil").click();

    await page.locator("icon=filter").click();
    await popover().contains("Text or Category").click();

    await popover().contains("Is").click();

    // Filter the first card by User Address
    await selectDashboardFilter(page.locator(".DashCard").first(), "Address");

    await page.locator("text=Done").click();
    await page.locator("text=Save").click();
    await page.locator("text=Orders in a dashboard").click();
  });

  test("should allow an admin user to select the filter", async ({ page }) => {
    await filterDashboard(page);
  });

  test("should allow a nodata user to select the filter", async ({ page }) => {
    await cy.signIn("nodata");
    await filterDashboard(page);
  });

  test("should not allow a nocollection user to visit the page, hence cannot see the filter", async ({ page }) => {
    await cy.signIn("nocollection");
    await page.request({
      method: "GET",
      url: "/api/dashboard/1",
      failOnStatusCode: false,
    }).should(xhr => {
      expect(xhr.status).to.equal(403);
    });
  });
});

