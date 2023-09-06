import {
  restore,
  visitQuestionAdhoc,
  popover,
  visualize,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "25378",
  dataset_query: {
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["count"]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
    },
    database: SAMPLE_DB_ID,
  },
  display: "line",
};


test.describe("issue 25378", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitQuestionAdhoc(questionDetails);
  });

  test("should be able to use relative date filter on a breakout after the aggregation (metabase#25378)", async ({ page }) => {
    await page.locator('icon[name="notebook"]').click();

    await page.locator(':text("Filter")').click();
    popover().contains("Created At").click();

    await page.locator(':text(/^Relative dates/)').click();
    await page.locator('[data-testid="select-button-content"]').contains("days").click();
    popover().last().contains("months").click();
    popover().within(() => {
      page.locator('icon[name="ellipsis"]').click();
    });
    await page.locator(':text(/^Starting from/)').click();

    await page.locator('button:text("Add filter")').click();

    visualize(response => {
      expect(response.body.error).to.not.exist;
    });
  });
});

