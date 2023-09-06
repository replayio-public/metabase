import {
  restore,
  openOrdersTable,
  popover,
  enterCustomColumnDetails,
  visualize,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, PRODUCTS_ID } = SAMPLE_DATABASE;

const newColumnName = "Product ID with a very long name";
const newTableName = "Products with a very long name";


test.describe("issue 20627", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    renameColumn(ORDERS.PRODUCT_ID, newColumnName);
    renameTable(PRODUCTS_ID, newTableName);
  });

  test("nested queries should handle long column and/or table names (metabase#20627)", async ({ page }) => {
    openOrdersTable({ mode: "notebook" });

    await page.click('text="Join data"');
    await page.click(`text="${newTableName}"`);

    await page.click('text="Summarize"');
    await page.click('text="Count of rows"');

    await page.click('text="Pick a column to group by"');
    await popover().within(async () => {
      await page.click(`text="${newTableName}"`);

      await page.click('text="Category"');
    });

    await page.click('text="Custom column"');
    enterCustomColumnDetails({ formula: "1 + 1", name: "Math" });
    await page.click('text="Done"');

    visualize();

    await expect(page.locator('.cellData'))
      .toContainText("Math")
      .toContainText("Doohickey")
      .toContainText("3,976");
  });
});


async function renameColumn(columnId, name) {
  await page.request("PUT", `/api/field/${columnId}`, { display_name: name });
}



async function renameTable(tableId, name) {
  await page.request("PUT", `/api/table/${tableId}`, { display_name: name });
}

