import { openOrdersTable, restore } from "e2e/support/helpers";


test.describe("issue 9339", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should not paste non-numeric values into single-value numeric filters (metabase#9339)", async ({ page }) => {
    await openOrdersTable(page);

    await page.locator('text=Total').click();
    await page.locator('text=Filter by this column').click();
    await page.locator('text=Equal to').click();
    await page.locator('text=Greater than').click();

    await paste(page.locator('input[placeholder="Enter a number"]'), "9339,1234");
    await expect(page.locator('input[value="9339"]')).toBeVisible();
    await expect(page.locator('text=1,234')).not.toBeVisible();
    await expect(page.locator('button:text("Add filter")')).toBeEnabled();
  });
});


const paste = (selection, text) => {
  selection.trigger("paste", { clipboardData: { getData: () => text } });
};
