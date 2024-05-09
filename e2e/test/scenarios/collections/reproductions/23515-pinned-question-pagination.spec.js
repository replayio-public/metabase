import { restore } from "e2e/support/helpers";


test.describe("issue 23515", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await signInAsAdmin(context);

    test.intercept("GET", "/api/**/items?pinned_state*").as("getPinnedItems");
    test.intercept("POST", "/api/card/*/query").as("getCardQuery");
  });

  test("should allow switching between different pages for a pinned question (metabase#23515)", async ({ page }) => {
    await page.request("PUT", `/api/card/1`, { collection_position: 1 });

    await page.goto("/collection/root");
    await page.waitForResponse("@getPinnedItems");
    await page.waitForResponse("@getCardQuery");

    await page.locator('aria-label="Next page"').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="Rows 4-6 of first 2000"')).toBeVisible();

    await page.locator('aria-label="Previous page"').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="Rows 1-3 of first 2000"')).toBeVisible();
  });
});
