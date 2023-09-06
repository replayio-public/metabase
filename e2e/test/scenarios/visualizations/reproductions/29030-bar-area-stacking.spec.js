import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS, PEOPLE, PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "29030",
  dataset_query: {
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [
        ["field", PEOPLE.SOURCE, { "source-field": ORDERS.USER_ID }],
        ["field", PRODUCTS.CATEGORY, { "source-field": ORDERS.PRODUCT_ID }],
      ],
    },
    database: SAMPLE_DB_ID,
  },
  display: "bar",
  visualization_settings: {
    "stackable.stack_type": "stacked",
    "stackable.stack_display": "bar",
  },
};


test.describe("issue 29030", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(questionDetails);
  });

  test("stacking type should update when transitioning between area and bar charts (29030)", async ({ page }) => {
    await page.locator('[data-testid="viz-type-button"]').click();
    await page.locator('[data-testid="Area-button"]').click().click();
    await page.locator('[data-testid="sidebar-content"]').locator('text=Display').click();

    await expect(page.locator('[data-testid="sidebar-content"]').locator('icon=area').closest('li')).toHaveAttribute('aria-checked', 'true');
  });
});
