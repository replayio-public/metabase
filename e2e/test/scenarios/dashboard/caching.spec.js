import {
  restore,
  describeEE,
  popover,
  visitDashboard,
  rightSidebar,
} from "e2e/support/helpers";

describeEE("scenarios > dashboard > caching", test.describe("scenarios > dashboard > caching", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.request("PUT", "/api/setting/enable-query-caching", { value: true });
  });

  test("can set cache ttl for a saved question", async ({ page }) => {
    await page.route("PUT", "/api/dashboard/1", { waitFor: "networkidle" });
    visitDashboard(1);

    await openDashboardInfo(page);

    await page.locator(rightSidebar()).within(() => {
      page.locator(/Cache Configuration/).click();
    });

    await page.locator(popover()).within(() => {
      page.locator("input[placeholder='24']").fill("48").blur();
      page.locator("button:text('Save changes')").click();
    });

    await page.waitForResponse("/api/dashboard/1");
    await page.reload();

    await openDashboardInfo(page);

    await page.locator(rightSidebar()).within(() => {
      page.locator(/Cache Configuration/).click();
    });

    await page.locator(popover()).within(() => {
      page.locator("input[value='48']").fill("0").blur();
      page.locator("button:text('Save changes')").click();
    });

    await page.waitForResponse("/api/dashboard/1");
    await page.reload();

    await openDashboardInfo(page);

    await page.locator(rightSidebar()).within(() => {
      page.locator(/Cache Configuration/).click();
    });

    await page.locator(popover()).within(() => {
      page.locator("input[placeholder='24']");
    });
  });
}));

async function openDashboardInfo(page) {
  await page.locator("main header").within(() => {
    page.locator("icon:text('info')").click();
  });
}
