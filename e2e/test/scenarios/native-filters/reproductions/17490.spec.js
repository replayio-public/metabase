import { openNativeEditor, restore } from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 17490", () => {
  test.beforeEach(async () => {
    mockDatabaseTables();

    restore();
    await signInAsAdmin();
  });

  test.skip("nav bar shouldn't cut off the popover with the tables for field filter selection (metabase#17490)", async ({ page }) => {
    openNativeEditor();
    SQLFilter.enterParameterizedQuery("{{f}}");

    SQLFilter.openTypePickerFromDefaultFilterType();
    SQLFilter.chooseType("Field Filter");

    /**
     * Although `.click()` isn't neccessary for Playwright to fill out this input field,
     * it's something that we can use to assert that the input field is covered by another element.
     * Playwright fails to click any element that is not "actionable" (for example - when it's covered).
     * In other words, the `.click()` part is essential for this repro to work. Don't remove it.
     */
    await page.locator('input[placeholder="Find..."]').click().type("Orders").blur();

    await expect(page.locator('input[value="Orders"]')).toBeVisible();
  });
});


async function mockDatabaseTables() {
  cy.intercept("GET", "/api/database?include=tables", req => {
    req.reply(res => {
      const mockTables = new Array(7).fill({
        id: 42, // id is hard coded, but it doesn't matter for this repro
        db_id: 1,
        name: "Z",
        display_name: "ZZZ",
        schema: "PUBLIC",
      });

      res.body.data = res.body.data.map(d => ({
        ...d,
        tables: [...d.tables, ...mockTables],
      }));
    });
  });
}
