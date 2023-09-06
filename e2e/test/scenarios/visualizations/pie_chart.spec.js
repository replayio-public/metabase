import { restore, visitQuestionAdhoc } from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const testQuery = {
  type: "query",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
    breakout: [["field", PRODUCTS.CATEGORY, null]],
  },
  database: SAMPLE_DB_ID,
};


test.describe("scenarios > visualizations > pie chart", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsNormalUser();
  });

  test("should render a pie chart (metabase#12506)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "pie",
    });

    ensurePieChartRendered(["Doohickey", "Gadget", "Gizmo", "Widget"], 200);
  });

  test("should mute items in legend when hovering (metabase#29224)", async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "pie",
    });

    await page.locator('[data-testid="chart-legend"]').locator('text=Doohickey').hover();
    [
      ["Doohickey", "true"],
      ["Gadget", "false"],
      ["Gizmo", "false"],
      ["Widget", "false"],
    ].map(args => checkLegendItemAriaCurrent(args[0], args[1]));
  });
});


async function ensurePieChartRendered(page, rows, totalValue) {
  await page.locator(".Visualization").within(async () => {
    // detail
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('[data-testid="detail-value"]')).toHaveText(totalValue);

    // slices
    await expect(page.locator('[data-testid="slice"]')).toHaveCount(rows.length);

    // legend
    rows.forEach(async (name, i) => {
      await expect(page.locator(".LegendItem").locator(`text=${name}`)).toBeVisible();
    });
  });
}


async function checkLegendItemAriaCurrent(page, title, value) {
  await expect(page.locator('[data-testid="chart-legend"]').locator(`[data-testid="legend-item-${title}"]`)).toHaveAttribute("aria-current", value);
}
