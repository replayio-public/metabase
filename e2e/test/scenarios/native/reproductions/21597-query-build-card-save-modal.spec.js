import {
  restore,
  popover,
  modal,
  openNativeEditor,
  addPostgresDatabase,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const databaseName = "Sample Database";
const databaseCopyName = `${databaseName} copy`;
const secondDatabaseId = SAMPLE_DB_ID + 1;

const { PRODUCTS } = SAMPLE_DATABASE;


test.describe("issue 21597", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("display the relevant error message in save question modal (metabase#21597)", async ({ page }) => {
    await page.route("POST", "/api/card", { alias: "saveNativeQuestion" });

    // Second DB (copy)
    addPostgresDatabase(databaseCopyName);

    // Create a native query and run it
    openNativeEditor({
      databaseName,
    }).type("SELECT COUNT(*) FROM PRODUCTS WHERE {{FILTER}}", {
      delay: 0,
      parseSpecialCharSequences: false,
    });

    await page.locator('[data-testid="select-button"]').click();
    popover().within(() => {
      page.locator('text="Field Filter"').click();
    });
    popover().within(() => {
      page.locator('text="Products"').click();
    });
    popover().within(() => {
      page.locator('text="Category"').click();
    });

    await page.locator('.NativeQueryEditor .Icon-play').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="200"')).toBeVisible();

    // Change DB
    // and re-run the native query
    await page.locator('.NativeQueryEditor .GuiBuilder-section')
      .locator('text="Sample Database"').click();
    popover().within(() => {
      page.locator(`text="${databaseCopyName}"`).click();
    });
    await page.locator('.NativeQueryEditor .Icon-play').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(`text="Failed to fetch Field ${PRODUCTS.CATEGORY}: Field does not exist, or belongs to a different Database."`)).toBeVisible();

    // Try to save the native query
    await page.locator('[data-testid="qb-header-action-panel"]').locator('text="Save"').click();
    modal().within(() => {
      page.locator('input[placeholder="What is the name of your question?"]').fill("Q");
      page.locator('text="Save"').click();
      page.waitForResponse("@saveNativeQuestion");
      page.locator(`text="Invalid Field Filter: Field ${PRODUCTS.CATEGORY} "PRODUCTS"."CATEGORY" belongs to Database ${SAMPLE_DB_ID} "${databaseName}", but the query is against Database ${secondDatabaseId} "${databaseCopyName}"`));
    });
  });
});

