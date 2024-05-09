import { visitQuestionAdhoc, restore, popover } from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;


test.describe("issue 27462", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should be able to select field when double aggregating metabase#27462", async ({ page }) => {
    const questionDetails = {
      dataset_query: {
        database: SAMPLE_DB_ID,
        type: "query",
        query: {
          "source-table": PRODUCTS_ID,
          aggregation: [["count"]],
          breakout: [["field", PRODUCTS.CATEGORY, null]],
        },
      },
      display: "table",
      visualization_settings: {},
    };

    visitQuestionAdhoc(questionDetails, { mode: "notebook" });

    await page.click('button:has-text("Summarize")');

    await page.locator('option:has-text("Sum of ...")').click();

    popover().within(() => {
      page.locator('option:has-text("Count")').click();
    });

    await page.click('button:has-text("Visualize")');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text("200")')).toBeVisible();
  });
});

