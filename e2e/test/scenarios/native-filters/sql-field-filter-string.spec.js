import { restore, openNativeEditor } from "e2e/support/helpers";

import { STRING_FILTER_SUBTYPES } from "./helpers/e2e-field-filter-data-objects";

import * as SQLFilter from "./helpers/e2e-sql-filter-helpers";
import * as FieldFilter from "./helpers/e2e-field-filter-helpers";

const stringFilters = Object.entries(STRING_FILTER_SUBTYPES);


test.describe("scenarios > filters > sql filters > field filter > String", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.intercept("POST", "api/dataset").as("dataset");

    cy.signInAsAdmin();

    openNativeEditor();
    SQLFilter.enterParameterizedQuery("SELECT * FROM products WHERE {{f}}");

    SQLFilter.openTypePickerFromDefaultFilterType();
    SQLFilter.chooseType("Field Filter");

    FieldFilter.mapTo({
      table: "Products",
      field: "Title",
    });
  });

  test("when set through the filter widget", async ({ page }) => {
    for (const [subType, { searchTerm, value, representativeResult }] of stringFilters) {
      test.log(`Make sure it works for ${subType.toUpperCase()}`);

      FieldFilter.setWidgetType(subType);

      FieldFilter.openEntryForm();
      FieldFilter.addWidgetStringFilter(value);

      SQLFilter.runQuery();

      await expect(page.locator(".Visualization")).toContainText(representativeResult);
    }
  });

  test("when set as the default value for a required filter", async ({ page }) => {
    SQLFilter.toggleRequired();

    for (const [subType, { searchTerm, value, representativeResult }] of stringFilters.entries()) {
      FieldFilter.setWidgetType(subType);

      // When we run the first iteration, there will be no default filter value set
      if (index !== 0) {
        FieldFilter.clearDefaultFilterValue();
      }

      FieldFilter.openEntryForm({ isFilterRequired: true });

      searchTerm
        ? FieldFilter.pickDefaultValue(searchTerm, value)
        : FieldFilter.addDefaultStringFilter(value);

      SQLFilter.runQuery();

      await expect(page.locator(".Visualization")).toContainText(representativeResult);
    }
  });
});

