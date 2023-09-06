import {
  restore,
  openNativeEditor,
  popover,
  filterWidget,
} from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 27257", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset").as("dataset");

    restore();
    await signInAsAdmin();

    openNativeEditor();
    SQLFilter.enterParameterizedQuery("SELECT {{number}}");

    filterWidget().within(() => {
      await page.locator('icon("string")');
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Variable type")').parent().locator('text("Text")').click();
    popover().contains("Number").click();

    filterWidget().within(() => {
      await page.locator('icon("number")');
      await page.locator('input[placeholder="Number"]').fill("0").blur();
      await page.locator('input[value="0"]');
    });

    SQLFilter.runQuery();

    await expect(page.locator(".ScalarValue").textContent()).toEqual("0");
  });

  test("should not drop numeric filter widget value on refresh even if it's zero (metabase#27257)", async ({ page }) => {
    await page.reload();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Here\'s where your results will appear")');
    await page.locator('input[value="0"]');
  });
});

