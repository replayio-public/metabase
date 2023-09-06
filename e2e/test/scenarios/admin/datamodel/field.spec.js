import {
  restore,
  withDatabase,
  visitAlias,
  popover,
  resetTestTable,
  startNewQuestion,
  resyncDatabase,
} from "e2e/support/helpers";
import {
  SAMPLE_DB_ID,
  SAMPLE_DB_SCHEMA_ID,
  WRITABLE_DB_ID,
} from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

// [quarantine] - intermittently failing, possibly due to a "flickering" element (re-rendering)
describe.skip("scenarios > admin > datamodel > field", 
test.describe("scenarios > admin > datamodel > field", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);

    ["CREATED_AT", "PRODUCT_ID", "QUANTITY"].forEach(name => {
      test.context[`ORDERS_${name}_URL`] = `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${ORDERS_ID}/field/${ORDERS[name]}/general`;
    });

    test.context.fieldUpdate = test.intercept("PUT", "/api/field/*");
    test.context.fieldDimensionUpdate = test.intercept("POST", "/api/field/*/dimension");
  });

  test.describe("Name and Description", () => {
    test.before(async () => {
      await restore(page);
    });

    test("lets you change field name and description", async ({ page }) => {
      // ... (rest of the test)
    });
  });

  // ... (rest of the tests)
});
);


async function getUnfoldJsonContent(page) {
  const unfoldJsonSection = await page.locator('text=Unfold JSON').closest('section');
  return unfoldJsonSection.locator('[data-testid=select-button-content]');
}



test.describe("Unfold JSON", () => {
  test.beforeEach(async ({ page }) => {
    await resetTestTable({ type: "postgres", table: "many_data_types", page });
    await restore(`postgres-writable`, page);
    await signInAsAdmin(page);
    await resyncDatabase({ dbId: WRITABLE_DB_ID, tableName: "many_data_types", page });
  });

  test("lets you enable/disable 'Unfold JSON' for JSON columns", async ({ page }) => {
    test.context.sync_schema = test.intercept("POST", `/api/database/${WRITABLE_DB_ID}/sync_schema`);
    // Go to field settings
    await page.goto(`/admin/datamodel/database/${WRITABLE_DB_ID}`);
    // ... (rest of the test)
  });
});

