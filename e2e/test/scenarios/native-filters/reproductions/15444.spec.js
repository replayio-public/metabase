import { restore, openNativeEditor, popover } from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";
import * as FieldFilter from "../helpers/e2e-field-filter-helpers";


test.describe("issue 15444", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    test.intercept("POST", "/api/dataset").as("dataset");
  });

  test("should run with the default field filter set (metabase#15444)", async ({ page }) => {
    openNativeEditor();
    SQLFilter.enterParameterizedQuery(
      "select * from products where {{category}}",
    );

    SQLFilter.openTypePickerFromDefaultFilterType();
    SQLFilter.chooseType("Field Filter");

    FieldFilter.mapTo({
      table: "Products",
      field: "Category",
    });

    SQLFilter.toggleRequired();

    FieldFilter.openEntryForm({ isFilterRequired: true });
    // We could've used `FieldFilter.addDefaultStringFilter("Doohickey")` but that's been covered already in the filter test matrix.
    // This flow tests the ability to pick the filter from a dropdown when there are not too many results (easy to choose from).
    popover().within(() => {
      page.locator('text=Doohickey').click();
      page.locator('text=Add filter').click();
    });

    SQLFilter.runQuery();

    page.locator(".Visualization").within(() => {
      page.locator('text=Doohickey');
      page.locator('text=Gizmo').should("not.exist");
    });
  });
});

