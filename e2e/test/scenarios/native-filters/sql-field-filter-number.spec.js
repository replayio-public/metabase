import { restore, openNativeEditor } from "e2e/support/helpers";

import { NUMBER_FILTER_SUBTYPES } from "./helpers/e2e-field-filter-data-objects";

import * as SQLFilter from "./helpers/e2e-sql-filter-helpers";
import * as FieldFilter from "./helpers/e2e-field-filter-helpers";

const numericFilters = Object.entries(NUMBER_FILTER_SUBTYPES);


test.describe("scenarios > filters > sql filters > field filter > Number", () => {
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
      field: "Rating",
    });
  });

  test("when set through the filter widget", async ({ page }) => {
    for (const [subType, { value, representativeResult }] of numericFilters) {
      test.log(`Make sure it works for ${subType.toUpperCase()}`);

      FieldFilter.setWidgetType(subType);

      FieldFilter.openEntryForm();
      FieldFilter.addWidgetNumberFilter(value);

      SQLFilter.runQuery();

      await expect(page.locator(".Visualization")).toContainText(representativeResult);
    }
  });

  test("when set as the default value for a required filter", async ({ page }) => {
    SQLFilter.toggleRequired();

    for (const [index, [subType, { value, representativeResult }]] of numericFilters.entries()) {
      test.log(`Make sure it works for ${subType.toUpperCase()}`);

      FieldFilter.setWidgetType(subType);

      // When we run the first iteration, there will be no default filter value set
      if (index !== 0) {
        FieldFilter.clearDefaultFilterValue();
      }

      FieldFilter.openEntryForm({ isFilterRequired: true });
      FieldFilter.addDefaultNumberFilter(value);

      SQLFilter.runQuery();

      await expect(page.locator(".Visualization")).toContainText(representativeResult);
    }
  });
});

