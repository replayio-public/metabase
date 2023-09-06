import {
  restore,
  popover,
  openProductsTable,
  summarize,
  enterCustomColumnDetails,
} from "e2e/support/helpers";


test.describe("issue 21513", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should handle cc with the same name as an aggregation function (metabase#21513)", async ({ page }) => {
    await openProductsTable({ mode: "notebook", page });
    await summarize({ mode: "notebook", page });
    await popover(page).findByText("Count of rows").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Pick a column to group by"').click();
    await popover(page).findByText("Category").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Custom column"').click();
    await enterCustomColumnDetails({
      formula: "[Count] * 2",
      name: "Double Count",
      page,
    });
    await page.locator('button:text("Done")').isEnabled();
  });
});

