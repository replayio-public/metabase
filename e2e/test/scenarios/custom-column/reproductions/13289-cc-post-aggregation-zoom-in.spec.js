import {
  restore,
  openOrdersTable,
  popover,
  enterCustomColumnDetails,
  visualize,
  summarize,
} from "e2e/support/helpers";

const CC_NAME = "Math";

test.describe("issue 13289", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset");

    restore();
    await page.signInAsAdmin();

    openOrdersTable({ mode: "notebook" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Custom column");

    // Add custom column that will be used later in summarize (group by)
    enterCustomColumnDetails({ formula: "1 + 1", name: CC_NAME });
    await page.click("text=Done");
  });

  test("should allow 'zoom in' drill-through when grouped by custom column (metabase#13289) (metabase#13289)", async ({ page }) => {
    summarize({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Count of rows");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Pick a column to group by");

    await popover().click("text=" + CC_NAME);

    await page.click("text=add").last();

    await popover().within(() => {
      page.click("text=Created At");
    });

    visualize();

    await page.locator(".Visualization").within(() => {
      page.locator("circle")
        .nth(5) // random circle in the graph (there is no specific reason for this index)
        .click({ force: true });
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=See this month by week");
    await page.waitForResponse("/api/dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=There was a problem with your question")).not.toBeVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=" + `${CC_NAME} is equal to 2`);
  });
});

