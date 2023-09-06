import {
  restore,
  changeBinningForDimension,
  getDimensionByName,
  getRemoveDimensionButton,
  summarize,
  visitQuestion,
  popover,
  openReviewsTable,
  openOrdersTable,
  enterCustomColumnDetails,
  visualize,
  checkExpressionEditorHelperPopoverPosition,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > question > summarize sidebar", () => {
  test.beforeEach(async ({ restore, signInAsAdmin, visitQuestion, summarize }) => {
    await restore();
    await signInAsAdmin();

    await visitQuestion(1);
    await summarize();
  });

  // ... other tests ...

});


async function removeMetricFromSidebar(metricName) {
  await page.locator(`[class*=SummarizeSidebar__AggregationToken] >> text=${metricName}`)
    .elementHandle()
    .then((element) => element.parentElement())
    .then((element) => element.locator('.Icon-close'))
    .then((element) => element.isVisible())
    .then((element) => element.click());
}

