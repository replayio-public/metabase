import {
  openOrdersTable,
  restore,
  visitQuestionAdhoc,
  openNativeEditor,
  visualize,
  summarize,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;

test.describe("scenarios > visualizations > waterfall", () => {
  test.beforeEach(async () => {
    restore();
    signInAsNormalUser();
  });

  async function verifyWaterfallRendering(page, xLabel = null, yLabel = null) {
    // a waterfall chart is just a stacked bar chart, with 4 bars
    // (not all of them will be visible at once, but they should exist)
    await page.locator(".Visualization .sub .chart-body").within(async () => {
      await page.locator(".stack._0");
      await page.locator(".stack._1");
      await page.locator(".stack._2");
      await page.locator(".stack._3");
    });
    await page.locator(".Visualization .axis.x").within(async () => {
      await page.locator("text").toHaveText("Total");
    });

    if (xLabel) {
      await page.locator(".Visualization .x-axis-label").within(async () => {
        await page.locator("text").toHaveText(xLabel);
      });
    }
    if (yLabel) {
      await page.locator(".Visualization .y-axis-label").within(async () => {
        await page.locator("text").toHaveText(yLabel);
      });
    }
  }

  // Add the remaining test cases here, replacing `cy` with `page` and updating the syntax accordingly
  // ...
});

const switchToWaterfallDisplay = (page) => {
  // Replace `cy` with `page` and update the syntax accordingly
};
