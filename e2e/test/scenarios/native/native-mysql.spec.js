import { restore, modal, openNativeEditor } from "e2e/support/helpers";

const MYSQL_DB_NAME = "QA MySQL8";


test.describe("scenatios > question > native > mysql", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    test.intercept("POST", "/api/card").as("createQuestion");
    test.intercept("POST", "/api/dataset").as("dataset");

    restore("mysql-8");
    cy.signInAsAdmin();
  });

  test('can write a native MySQL query with a field filter', async ({ page }) => {
    // Write Native query that includes a filter
    openNativeEditor({ databaseName: MYSQL_DB_NAME }).type(
      `SELECT TOTAL, CATEGORY FROM ORDERS LEFT JOIN PRODUCTS ON ORDERS.PRODUCT_ID = PRODUCTS.ID [[WHERE PRODUCTS.ID = {{id}}]];`,
      {
        parseSpecialCharSequences: false,
      },
    );
    await page.locator('.NativeQueryEditor .Icon-play').click();

    await test.waitForResponse("@dataset");

    const queryPreview = page.locator('.Visualization');

    await queryPreview.isVisible().contains("Widget");

    // Filter by Product ID = 1 (its category is Gizmo)
    await page.locator('input[placeholder*="Id"]').click().type("1");

    await page.locator('.NativeQueryEditor .Icon-play').click();

    await queryPreview.contains("Widget").should("not.exist");

    await queryPreview.contains("Gizmo");
  });

  test('can save a native MySQL query', async ({ page }) => {
    openNativeEditor({ databaseName: MYSQL_DB_NAME }).type(
      `SELECT * FROM ORDERS`,
    );
    await page.locator('.NativeQueryEditor .Icon-play').click();

    await test.waitForResponse("@dataset");
    await page.locator('.Visualization').contains("SUBTOTAL");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("37.65")');

    // Save the query
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Save")').click();

    modal().within(() => {
      page.locator('input[aria-label="Name"]').focus().type("sql count");

      page.locator('button:text("Save")').should("not.be.disabled").click();
    });

    await test.waitForResponse("@createQuestion");

    await page.locator(':text("Not now")').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Save")').should("not.exist");
    await page.url().should("match", /\/question\/\d+-[a-z0-9-]*$/);
  });
});

