import {
  restore,
  visitQuestionAdhoc,
  popover,
  visualize,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    type: "query",
    query: {
      "source-table": PRODUCTS_ID,
      aggregation: [
        ["min", ["field", PRODUCTS.CREATED_AT, { "temporal-unit": "day" }]],
      ],
      breakout: [["field", PRODUCTS.CATEGORY, null]],
    },
    database: SAMPLE_DB_ID,
  },
};


test.describe("issue 25994", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitQuestionAdhoc(questionDetails);
    await page.locator('icon[name="notebook"]').click();
  });

  test("should be possible to use 'between' dates filter after aggregation (metabase#25994)", async ({ page }) => {
    await page.locator('text=Filter').click();
    await popover().locator('text=Min of Created At: Day').click();
    await page.locator('text=Specific dates...').click();

    // It doesn't really matter which dates we select so let's go with whatever is offered
    await page.locator('button:text=Add filter').click();

    visualize(response => {
      expect(response.body.error).to.not.exist;
    });
  });
});

