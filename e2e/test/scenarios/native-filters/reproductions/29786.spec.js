import { filterWidget, openNativeEditor, restore } from "e2e/support/helpers";
import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";
import * as FieldFilter from "../helpers/e2e-field-filter-helpers";

const SQL_QUERY = "SELECT * FROM PRODUCTS WHERE {{f1}} AND {{f2}}";


test.describe("issue 29786", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore("mysql-8");
    cy.intercept("POST", "/api/dataset").as("dataset");
    cy.signInAsAdmin();
  });

  test("should allow using field filters with null schema (metabase#29786)", async ({ page }) => {
    openNativeEditor({ databaseName: "QA MySQL8" });
    SQLFilter.enterParameterizedQuery(SQL_QUERY);

    await page.locator('text=Text').first().click();
    SQLFilter.chooseType("Field Filter");
    FieldFilter.mapTo({ table: "Products", field: "Category" });
    await page.locator('text=Text').last().click();
    SQLFilter.chooseType("Field Filter");
    FieldFilter.mapTo({ table: "Products", field: "Vendor" });

    filterWidget().first().click();
    FieldFilter.addWidgetStringFilter("Widget");
    filterWidget().last().click();
    FieldFilter.addWidgetStringFilter("Von-Gulgowski");

    SQLFilter.runQuery();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=1087115303928')).toBeVisible();
  });
});

