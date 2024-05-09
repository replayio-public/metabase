import {
  restore,
  popover,
  openProductsTable,
  summarize,
  sidebar,
} from "e2e/support/helpers";


test.describe("time-series filter widget", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    openProductsTable();
  });

  test("should properly display All Time as the initial filtering (metabase#22247)", async ({ page }) => {
    summarize();

    sidebar().contains("Created At").click();
    await page.waitForResponse("@dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=All Time");

    popover().within(() => {
      // Implicit assertion: there is only one select button
      await expect(page.locator('[data-testid="select-button-content"]')).toHaveText("All Time");

      await expect(page.locator('button:text("Apply")')).not.toBeDisabled();
    });
  });

  // Skip the rest of the tests until https://github.com/metabase/metabase/issues/22973 gets resolved
  test.skip("should allow switching from All Time filter", async ({ page }) => {
    await page.click('text=Summarize');
    await page.click('text=Created At');
    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Done");

    // switch to previous 30 quarters
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=All Time");
    popover().within(() => {
      await page.click('text=All Time');
    });
    await page.click('text=Previous');
    await page.click('text=days');
    await page.click('text=quarters');
    await page.click('button:text("Apply")');
    await page.waitForResponse("@dataset");

    await page.locator('text=Created At Previous 30 Quarters').isVisible();
    await page.locator('text=Previous 30 Quarters').isVisible();
  });

  test.skip("should stay in-sync with the actual filter", async ({ page }) => {
    await page.click('text=Filter');
    await page.click('text=Created At');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Last 3 Months");
    await page.waitForResponse("@dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Created At Previous 3 Months");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=months");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=years");
    await page.click('button:text("Add filter")');
    await page.waitForResponse("@dataset");

    await page.click('text=Summarize');
    await page.click('text=Created At');
    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Done");

    await page.locator('text=Created At Previous 3 Years').isVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Previous 3 Years");
    popover().within(() => {
      await expect(page.locator('text=Previous')).toBeVisible();
      await expect(page.locator('text=All Time')).not.toBeVisible();
      await expect(page.locator('text=Next')).not.toBeVisible();
    });

    // switch to All Time filter
    popover().within(() => {
      await page.click('text=Previous');
    });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=All Time");
    await page.click('button:text("Apply")');
    await page.waitForResponse("@dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Created At Previous 3 Years")).not.toBeVisible();
    await page.locator('text=All Time').isVisible();
  });
});

