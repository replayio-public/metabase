import {
  openOrdersTable,
  popover,
  restore,
  visualize,
  summarize,
} from "e2e/support/helpers";


test.describe("issue 6239", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await openOrdersTable({ mode: "notebook", page });

    await summarize({ mode: "notebook", page });
    await page.click('text="Custom Expression"');

    await page.locator('.ace_text-input').fill("CountIf([Total] > 0)").blur();

    await page.fill('placeholder="Something nice and descriptive"', "CE");
    await page.click('text="Done"');

    await page.click('text="Pick a column to group by"');
    await popover(page).locator('text="Created At"').first().click();
  });

  test('should be possible to sort by using custom expression (metabase#6239)', async ({ page }) => {
    await page.click('text="Sort"');
    await popover(page).locator('text=/^CE$/').click();

    await visualize(page);

    // Line chart renders initially. Switch to the table view.
    await page.click('css=[icon="table2"]');

    await expect(page.locator('.cellData').nth(1)).toContainText("CE");
    await expect(page.locator('.cellData').nth(1)).toHaveDescendant('.Icon-chevronup');

    await expect(page.locator('.cellData').nth(3).textContent()).toEqual("1");

    // Go back to the notebook editor
    await page.click('css=[icon="notebook"]');

    // Sort descending this time
    await page.click('css=[icon="arrow_up"]');
    await expect(page.locator('css=[icon="arrow_up"]')).not.toBeVisible();
    await expect(page.locator('css=[icon="arrow_down"]')).toBeVisible();

    await visualize(page);

    await expect(page.locator('.cellData').nth(1)).toContainText("CE");
    await expect(page.locator('.cellData').nth(1)).toHaveDescendant('.Icon-chevrondown');

    await expect(page.locator('.cellData').nth(3).textContent()).toEqual("584");
  });
});

