import {
  restore,
  visitQuestionAdhoc,
  getDraggableElements,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "28304",
  dataset_query: {
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
    },
    database: SAMPLE_DB_ID,
  },
  display: "table",
  visualization_settings: {
    "table.columns": [
      {
        fieldRef: ["field", ORDERS.ID, null],
        enabled: true,
      },
      {
        fieldRef: ["field", ORDERS.USER_ID, null],
        enabled: true,
      },
      {
        fieldRef: ["field", ORDERS.PRODUCT_ID, null],
        enabled: true,
      },
      {
        fieldRef: ["field", ORDERS.SUBTOTAL, null],
        enabled: true,
      },
      {
        fieldRef: ["field", ORDERS.TAX, null],
        enabled: true,
      },
      {
        fieldRef: ["field", ORDERS.DISCOUNT, null],
        enabled: true,
      },
    ],
    column_settings: {
      '["name","count"]': { show_mini_bar: true },
    },
  },
};


test.describe("issue 28304", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitQuestionAdhoc(questionDetails);
  });

  test("table should should generate default columns when table.columns entries do not match data.cols (metabase#28304)", async ({ page }) => {
    await expect(page.locator('text=Count by Created At: Month')).toBeVisible();

    await page.locator('[data-testid="viz-settings-button"]').click();
    await expect(leftSidebar()).not.toContainText("[Unknown]");
    await expect(leftSidebar()).toContainText("Created At");
    await expect(leftSidebar()).toContainText("Count");
    await expect(page.locator('[data-testid="mini-bar"]')).toHaveCountGreaterThan(0);
    await expect(getDraggableElements()).toHaveCount(2);
  });
});



async function leftSidebar() {
  return page.locator('[data-testid="sidebar-left"]');
}

