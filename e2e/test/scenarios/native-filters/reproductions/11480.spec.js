import { restore, openNativeEditor } from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 11480", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset");

    restore();
    await cy.signInAsAdmin();
  });

  test("should clear a template tag's default value when the type changes (metabase#11480)", async ({ page }) => {
    openNativeEditor();
    // Parameter `x` defaults to a text parameter.
    SQLFilter.enterParameterizedQuery(
      "select * from orders where total = {{x}}",
    );

    // Mark field as required and add a default text value.
    SQLFilter.toggleRequired();
    SQLFilter.setDefaultValue("some text");

    // Run the query and see an error.
    SQLFilter.runQuery();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(`text=Data conversion error converting "some text"`)).toBeVisible();

    // Oh wait! That doesn't match the total column, so we'll change the parameter to a number.
    SQLFilter.openTypePickerFromDefaultFilterType();
    SQLFilter.chooseType("Number");

    // When we run it again, the default has been cleared out so we get the right error.
    SQLFilter.runQuery();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(`text=You'll need to pick a value for 'X' before this query can run.`)).toBeVisible();
  });
});

