import {
  restore,
  visitQuestionAdhoc,
  getDraggableElements,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "28311",
  dataset_query: {
    type: "query",
    query: {
      "source-table": ORDERS_ID,
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
        enabled: false,
      },
      {
        fieldRef: ["field", ORDERS.TAX, null],
        enabled: false,
      },
      {
        fieldRef: ["field", ORDERS.DISCOUNT, null],
        enabled: false,
      },
    ],
  },
};


test.describe("issue 25250", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(questionDetails);
  });

  test("pivot table should show standalone values when collapsed to the sub-level grouping (metabase#25250)", async ({ page }) => {
    await expect(page.locator('text="Product ID"')).toBeVisible();

    await page.locator('[data-testid="viz-settings-button"]').click();
    await moveColumnUp(page.locator(getDraggableElements().contains("Product ID")), 2);
    await expect(getDraggableElements().nth(0)).toContainText("Product ID");
  });
});


function moveColumnUp(column, distance) {
  column
    .trigger("mousedown", 0, 0, { force: true })
    .trigger("mousemove", 5, -5, { force: true })
    .trigger("mousemove", 0, distance * -50, { force: true })
    .trigger("mouseup", 0, distance * -50, { force: true });
}
