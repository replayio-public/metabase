import { restore, openNativeEditor } from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 15981", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    openNativeEditor();

    await page.route("POST", "/api/dataset");
  });

  test(`"Text" filter should work (metabase#15981-1)`, async ({ page }) => {
    SQLFilter.enterParameterizedQuery(
      "select * from PRODUCTS where CATEGORY = {{text_filter}}",
    );

    SQLFilter.setWidgetValue("Gizmo");

    SQLFilter.runQuery();

    await expect(page.locator(".Visualization")).toContainText("Rustic Paper Wallet");

    await page.locator('.Icon[aria-label="contract"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(':text("Showing 51 rows")')).toBeVisible();
    await expect(page.locator('.Icon[aria-label="play"]')).not.toBeVisible();
  });

  test(`"Number" filter should work (metabase#15981-2)`, async ({ page }) => {
    SQLFilter.enterParameterizedQuery(
      "select * from ORDERS where QUANTITY = {{number_filter}}",
    );

    SQLFilter.openTypePickerFromDefaultFilterType();
    SQLFilter.chooseType("Number");

    SQLFilter.setWidgetValue("20");

    SQLFilter.runQuery();

    await expect(page.locator(".Visualization")).toContainText("23.54");
  });
});
