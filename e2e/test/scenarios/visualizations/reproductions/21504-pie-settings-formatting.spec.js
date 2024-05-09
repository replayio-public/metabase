import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("issue 21504", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsNormalUser(page);
  });

  test("should format pie chart settings (metabase#21504)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "query",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }],
          ],
        },
        database: SAMPLE_DB_ID,
      },
      display: "pie",
    });

    await page.locator('[data-testid="viz-settings-button"]').click();
    await page.locator(':text("Display")').click();
    await expect(page.locator(':text("April, 2016")')).toBeVisible();
  });
});

