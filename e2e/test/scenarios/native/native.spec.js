import {
  restore,
  modal,
  openNativeEditor,
  visitQuestionAdhoc,
  summarize,
  rightSidebar,
  filter,
  filterField,
  getCollectionIdFromSlug,
  visitCollection,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > question > native", () => {
  test.beforeEach(async () => {
    await intercept("POST", "api/card");
    await intercept("POST", "api/dataset");
    await intercept("POST", "api/dataset/native");
    restore();
    signInAsNormalUser();
  });

  test('lets you create and run a SQL question', async ({ page }) => {
    await openNativeEditor(page).type("select count(*) from orders");
    await runQuery(page);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=18,760")).toBeVisible();
  });

  // ... other tests
});

const runQuery = async (page) => {
  await page.locator('[data-testid="native-query-editor-container"]').locator('button:text("Get Answer")').click();
  await page.waitForResponse('**/api/dataset');
};

async function ensureDatabasePickerIsHidden(page) {
  await expect(page.locator('#DatabasePicker')).not.toBeVisible();
}
