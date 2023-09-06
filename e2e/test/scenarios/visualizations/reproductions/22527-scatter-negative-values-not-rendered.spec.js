import { restore, popover } from "e2e/support/helpers";

const questionDetails = {
  native: {
    query:
      "select 1 x, 1 y, 20 size\nunion all  select 2 x, 10 y, 10 size\nunion all  select 3 x, -9 y, 6 size\nunion all  select 4 x, 100 y, 30 size\nunion all  select 5 x, -20 y, 70 size",
  },
  display: "scatter",
  visualization_settings: {
    "graph.dimensions": ["X"],
    "graph.metrics": ["Y"],
  },
};

describe.skip("issue 22527", (() => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();

    createNativeQuestion(questionDetails, { visitQuestion: true });
  });

  test('should render negative values in a scatter visualziation (metabase#22527)', async () => {
    assertion();

    await page.locator('[data-testid="viz-settings-button"]').click();
    await page.locator('[data-testid="sidebar-left"]').within(() => {
      page.locator('text=Data').click();
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Bubble size').parent().locator('text=Select a field').click();

    popover().locator(/size/i).click();

    assertion();
  });
});

async function assertion() {
  await expect(page.locator("circle")).toHaveCount(5);
  await page.locator("circle").last().hover();

  popover().within(() => {
    testPairedTooltipValues("X", "5");
    testPairedTooltipValues("Y", "-20");
    testPairedTooltipValues("SIZE", "70");
  });
}

async function testPairedTooltipValues(val1, val2) {
  await page.locator(`text=${val1}`).closest("td").sibling("td").locator(`text=${val2}`);
}
