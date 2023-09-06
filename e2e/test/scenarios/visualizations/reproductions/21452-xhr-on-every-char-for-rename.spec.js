import {
  restore,
  visitQuestionAdhoc,
  popover,
  openSeriesSettings,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      aggregation: [["cum-sum", ["field", ORDERS.QUANTITY, null]]],
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }]],
    },
    database: 1,
  },
  display: "line",
};


test.describe("issue 21452", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitQuestionAdhoc(questionDetails);

    await page.locator('[data-testid="viz-settings-button"]').click();
  });

  test("should not fire POST request after every character during display name change (metabase#21452)", async ({ page }) => {
    openSeriesSettings("Sum of Quantity");
    await page.locator('[displayvalue="Sum of Quantity"]').clear().type("Foo");
    await page.locator(':text("Display type")').click();
    await page.waitForResponse("@dataset");
    await page.locator(':text("Done")').click();

    await page.locator("circle").first().hover();

    popover().within(() => {
      testPairedTooltipValues("Created At", "2016");
      testPairedTooltipValues("Foo", "3,236");
    });

    expect(page.locator("@dataset.all")).toHaveLength(2);
  });
});


async function testPairedTooltipValues(val1, val2) {
  await page.locator(`:text("${val1}")`).closest("td").sibling("td").locator(`:text("${val2}")`);
}
