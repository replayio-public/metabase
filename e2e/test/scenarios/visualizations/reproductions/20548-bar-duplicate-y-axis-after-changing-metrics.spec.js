import { restore, summarize, popover, sidebar } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "20548",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["sum", ["field", PRODUCTS.PRICE, null]], ["count"]],
    breakout: [["field", PRODUCTS.CATEGORY, null]],
  },
  display: "bar",
  // We are reversing the order of metrics via API
  visualization_settings: {
    "graph.metrics": ["count", "sum"],
    "graph.dimensions": ["CATEGORY"],
  },
};


test.describe("issue 20548", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails, { visitQuestion: true });
    summarize();
  });

  test('should not display duplicate Y-axis after modifying/reordering metrics (metabase#20548)', async ({ page }) => {
    removeAggregationItem("Count");
    await expect(page.locator('.bar')).toHaveCount(4);

    addAggregationItem("Count");
    await expect(page.locator('.bar')).toHaveCount(8);

    // Although the test already fails on the previous step, let's add some more assertions to prevent future regressions
    assertOnLegendItemFrequency("Count", 1);
    assertOnLegendItemFrequency("Sum of Price", 1);

    await page.locator('[data-testid="viz-settings-button"]').click();
    // Implicit assertion - it would fail if it finds more than one "Count" in the sidebar
    sidebar().findAllByText("Count").should("have.length", 1);
  });
});



async function removeAggregationItem(item) {
  await page.locator(`[data-testid="aggregation-item"]:has-text("${item}")`)
    .sibling('.Icon-close')
    .click();

  await page.waitForResponse("@dataset");
}



async function addAggregationItem(item) {
  await page.locator('[data-testid="add-aggregation-button"]').click();
  await popover().locator(`:has-text("${item}")`).click();

  await page.waitForResponse("@dataset");
}


/**
 * @param {string} item
 * @param {number} frequency
 */

async function assertOnLegendItemFrequency(item, frequency) {
  await expect(page.locator(`[data-testid="legend-item"]:has-text("${item}")`)).toHaveCount(frequency);
}

