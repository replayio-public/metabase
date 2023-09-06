import {
  enterCustomColumnDetails,
  popover,
  restore,
  visualize,
  openProductsTable,
  summarize,
  leftSidebar,
} from "e2e/support/helpers";


test.describe("issue 18207", () => {
  test.beforeEach(async ({ restore, signInAsAdmin, openProductsTable, summarize, visualize }) => {
    await restore();
    await signInAsAdmin();

    openProductsTable({ mode: "notebook" });
    summarize({ mode: "notebook" });
  });

  test('should be possible to use MIN on a string column (metabase#18207, metabase#22155)', async ({ page }) => {
    await page.locator('text=Minimum of').click();
    await page.locator('text=Price');
    await page.locator('text=Rating');
    await page.locator('text=Ean').isVisible();
    await page.locator('text=Category').click();

    visualize();

    await page.locator('text=Doohickey');
  });

  test('should be possible to use MAX on a string column (metabase#18207, metabase#22155)', async ({ page }) => {
    await page.locator('text=Maximum of').click();
    await page.locator('text=Price');
    await page.locator('text=Rating');
    await page.locator('text=Ean').isVisible();
    await page.locator('text=Category').click();

    visualize();

    await page.locator('text=Widget');
  });

  test('should be not possible to use AVERAGE on a string column (metabase#18207, metabase#22155)', async ({ page }) => {
    await page.locator('text=Average of').click();
    await page.locator('text=Price');
    await page.locator('text=Rating');
    await page.locator('text=Ean').isNotVisible();
    await page.locator('text=Category').isNotVisible();
  });

  test('should be possible to group by a string expression (metabase#18207)', async ({ page }) => {
    await popover().locator('text=Custom Expression').click();
    await popover().within(async () => {
      enterCustomColumnDetails({ formula: "Max([Vendor])" });
      await page.locator('input[placeholder="Something nice and descriptive"]').fill('LastVendor');
      await page.locator('text=Done').click();
    });

    await page.locator('text=Pick a column to group by').click();
    await popover().locator('text=Category').click();

    visualize();

    await page.locator('text=Visualization').click();
    await leftSidebar().within(async () => {
      await page.locator('icon=table').click();
      await page.locator('testId=Table-button').realHover();
      await page.locator('icon=gear').click();
    });
    await page.locator('text=Done').click();

    await page.locator('text=Zemlak-Wiegand');
  });
});

