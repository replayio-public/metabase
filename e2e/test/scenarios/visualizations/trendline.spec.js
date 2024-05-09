import { restore, leftSidebar } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "12781",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [
      ["avg", ["field", ORDERS.SUBTOTAL, null]],
      ["sum", ["field", ORDERS.TOTAL, null]],
    ],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }]],
  },
  display: "line",
};


test.describe("scenarios > question > trendline", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsNormalUser(page);

    await createQuestion(page, questionDetails, { visitQuestion: true });
  });

  test("displays trendline when there are multiple numeric outputs (for simple question) (metabase#12781)", async ({ page }) => {
    // Change settings to trendline
    await page.locator('text=Visualization').click();
    await page.locator('[data-testid="viz-settings-button"]').click();
    await page.locator('text=Display').click();
    await page.locator('text=Trend line').parent().children().last().click();

    // Check graph is still there
    await page.locator("rect");

    // Remove sum of total
    await leftSidebar(page).within(async () => {
      await page.locator('text=Data').click();
      await page.locator('icon=close').last().click();
      await page.locator('text=Done').click();
    });

    // Graph should still exist
    await expect(page.locator('placeholder=Created At')).not.toBeVisible();
    await page.locator("rect");
  });
});

