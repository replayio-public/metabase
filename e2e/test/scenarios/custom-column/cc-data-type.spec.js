import {
  restore,
  openTable,
  popover,
  enterCustomColumnDetails,
  filter,
  openOrdersTable,
  visualize,
  getNotebookStep,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, PEOPLE_ID, PRODUCTS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > question > custom column > data type", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test("should understand string functions (metabase#13217)", async ({ page }) => {
    openCustomColumnInTable(PRODUCTS_ID);

    enterCustomColumnDetails({
      formula: "concat([Category], [Title])",
      name: "CategoryTitle",
    });

    await page.click('button:text("Done")');

    filter({ mode: "notebook" });

    popover().findByText("CategoryTitle").click();

    await expect(page.locator('input[placeholder="Enter a number"]')).not.toBeVisible();
    await page.locator('input[placeholder="Enter some text"]');
  });

  test("should understand date functions", async ({ page }) => {
    openOrdersTable({ mode: "notebook" });

    addCustomColumns([
      { name: "Year", formula: "year([Created At])" },
      { name: "Quarter", formula: "quarter([Created At])" },
      { name: "Month", formula: "month([Created At])" },
      { name: "Week", formula: 'week([Created At], "iso")' },
      { name: "Day", formula: "day([Created At])" },
      { name: "Weekday", formula: "weekday([Created At])" },
      { name: "Hour", formula: "hour([Created At])" },
      { name: "Minute", formula: "minute([Created At])" },
      { name: "Second", formula: "second([Created At])" },
      {
        name: "Datetime Add",
        formula: 'datetimeAdd([Created At], 1, "month")',
      },
      {
        name: "Datetime Subtract",
        formula: 'datetimeSubtract([Created At], 1, "month")',
      },
      {
        name: "ConvertTimezone 3 args",
        formula: 'convertTimezone([Created At], "Asia/Ho_Chi_Minh", "UTC")',
      },
      {
        name: "ConvertTimezone 2 args",
        formula: 'convertTimezone([Created At], "Asia/Ho_Chi_Minh")',
      },
    ]);

    visualize();
  });

  test("should relay the type of a date field", async ({ page }) => {
    openCustomColumnInTable(PEOPLE_ID);

    enterCustomColumnDetails({ formula: "[Birth Date]", name: "DoB" });
    await page.click('button:text("Done")');

    filter({ mode: "notebook" });
    popover().findByText("DoB").click();

    await expect(page.locator('input[placeholder="Enter a number"]')).not.toBeVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Relative dates...").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Past").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("days");
  });

  test("should handle CASE (metabase#13122)", async ({ page }) => {
    openCustomColumnInTable(ORDERS_ID);

    enterCustomColumnDetails({
      formula: "case([Discount] > 0, [Created At], [Product → Created At])",
      name: "MiscDate",
    });
    await page.click('button:text("Done")');

    filter({ mode: "notebook" });
    popover().findByText("MiscDate").click();

    await expect(page.locator('input[placeholder="Enter a number"]')).not.toBeVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Relative dates...").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Past").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("days");
  });

  test("should handle COALESCE", async ({ page }) => {
    openCustomColumnInTable(ORDERS_ID);

    enterCustomColumnDetails({
      formula: "COALESCE([Product → Created At], [Created At])",
      name: "MiscDate",
    });
    await page.click('button:text("Done")');

    filter({ mode: "notebook" });
    popover().findByText("MiscDate").click();

    await expect(page.locator('input[placeholder="Enter a number"]')).not.toBeVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Relative dates...").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Past").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("days");
  });
});



async function addCustomColumns(columns, page) {
  for (const [index, column] of columns.entries()) {
    if (index) {
      getNotebookStep("expression").icon("add").click();
    } else {
      await page.click('button:text("Custom column")');
    }

    enterCustomColumnDetails(column);
    await page.click('button:text("Done")');
  }
}



async function openCustomColumnInTable(table, page) {
  openTable({ table, mode: "notebook" });
  await page.click('button:text("Custom column")');
}

