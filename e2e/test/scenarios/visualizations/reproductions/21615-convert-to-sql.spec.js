import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("issue 21615", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("should not throw an error when converting a table question to sql (metabase#21615)", async ({ page }) => {
    visitQuestionAdhoc({
      display: "table",
      dataset_query: {
        type: "query",
        database: 1,
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }],
          ],
        },
      },
    });

    await page.locator('svg[name="notebook"]').click();
    await page.locator('svg[name="sql"]').click();
    await page.locator('button:text("Convert this question to SQL")').click();

    await expect(page.locator(':text("Visualization")')).toBeVisible();
    await expect(page.locator(':text("Something went wrong")')).not.toBeVisible();
  });
});

