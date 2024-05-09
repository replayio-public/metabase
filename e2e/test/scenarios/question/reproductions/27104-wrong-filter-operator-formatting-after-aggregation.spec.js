import {
  restore,
  popover,
  visitQuestionAdhoc,
  visualize,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS, PEOPLE } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [["field", PEOPLE.SOURCE, { "source-field": ORDERS.USER_ID }]],
    },
    type: "query",
  },
  display: "bar",
};


test.describe("issue 27104", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitQuestionAdhoc(questionDetails, { mode: "notebook" });
  });

  test("should correctly format the filter operator after the aggregation (metabase#27104)", async ({ page }) => {
    await page.locator('[data-testid="action-buttons"]').last().locator('text=Filter').click();
    await popover().locator('text=Count').click();
    await popover().within(async () => {
      // The following line is the main assertion.
      await expect(page.locator('[data-testid="sidebar-header-title"]')).toHaveText("Count");
      // The rest of the test is not really needed for this reproduction.
      await page.locator('[data-testid="select-button"]').locator('text=Equal to').click();
    });
    await popover().locator('text=Greater than').click();
    await page.locator('input[placeholder="Enter a number"]').fill("0").blur();
    await popover().button("Add filter").click();

    visualize();

    await page.locator('[data-testid="qb-filters-panel"]').locator('text=Count is greater than 0');
    await expect(page.locator('.bar')).toHaveCount(5);
  });
});

