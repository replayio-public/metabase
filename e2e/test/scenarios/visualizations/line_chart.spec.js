import {
  restore,
  visitQuestionAdhoc,
  popover,
  visitDashboard,
  openSeriesSettings,
  queryBuilderMain,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID, PEOPLE, PEOPLE_ID } =
  SAMPLE_DATABASE;

const Y_AXIS_RIGHT_SELECTOR = ".axis.yr";

const testQuery = {
  type: "query",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["datetime-field", ["field-id", ORDERS.CREATED_AT], "month"]],
  },
  database: SAMPLE_DB_ID,
};

test.describe("scenarios > visualizations > line chart", () => {
  test.beforeEach(async ({ restore, signInAsNormalUser }) => {
    await restore();
    await signInAsNormalUser();
  });

  test("should be able to change y axis position (metabase#13487)", async ({ visitQuestionAdhoc, findByTestId, get, openSeriesSettings, Y_AXIS_RIGHT_SELECTOR }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "line",
    });

    await findByTestId("viz-settings-button").click();
    openSeriesSettings("Count");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await findByText("Right").click();
    await get(Y_AXIS_RIGHT_SELECTOR);
  });

  // ... other tests ...

});

async function testPairedTooltipValues(val1, val2) {
  await expect(page.locator(`text=${val1}`).sibling('td')).toHaveText(val2);
}

async function showTooltipForFirstCircleInSeries(series_index) {
  await page.locator(`.sub._${series_index}`)
    .locator("circle")
    .first()
    .dispatchEvent("mousemove", { force: true });
}
