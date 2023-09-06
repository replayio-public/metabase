import {
  restore,
  popover,
  visitDashboard,
  saveDashboard,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > visualizations > line/bar chart > tooltips", () => {
  test.beforeEach(async ({ page }) => {
    await restore(page);
    await cy.signInAsAdmin(page);
  });

  test.describe("> single series question on dashboard", () => {
    test.beforeEach(async ({ page }) => {
      await setup(page, {
        question: {
          name: "Q1",
          query: {
            "source-table": ORDERS_ID,
            aggregation: [["sum", ["field", ORDERS.TOTAL, null]]],
            breakout: [
              ["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }],
            ],
          },
          display: "line",
        },
      }).then(dashboardId => {
        visitDashboard(dashboardId);
      });
    });

    test('should show updated column titles in tooltips after editing them via Visualization Options', async ({ page }) => {
      const originalTooltipText = [
        ["Created At", "2016"],
        ["Sum of Total", "42,156.87"],
      ];

      const updatedTooltipText = [
        ["Created At", "2016"],
        ["Custom", "42,156.87"],
      ];

      const seriesIndex = 0;

      await showTooltipForFirstCircleInSeries(page, seriesIndex);
      await testTooltipText(page, originalTooltipText);

      await openDashCardVisualizationOptions(page);

      await updateColumnTitle(page, originalTooltipText[1][0], updatedTooltipText[1][0]);

      await saveDashCardVisualizationOptions(page);

      await showTooltipForFirstCircleInSeries(page, seriesIndex);
      await testTooltipText(page, updatedTooltipText);
    });
  });

  // Add the remaining test.describe blocks here, following the same pattern as above

});

async function setup(page, { question, addedSeriesQuestion }) {
  return cy.createQuestion(page, question).then(({ body: { id: card1Id } }) => {
    if (addedSeriesQuestion) {
      cy.createQuestion(page, addedSeriesQuestion).then(
        ({ body: { id: card2Id } }) => {
          return setupDashboard(page, card1Id, card2Id);
        },
      );
    } else {
      return setupDashboard(page, card1Id);
    }
  });
}

async function setupDashboard(page, cardId, addedSeriesCardId) {
  return cy.createDashboard(page).then(({ body: { id: dashboardId } }) => {
    return addOrUpdateDashboardCard(page, {
      dashboard_id: dashboardId,
      card_id: cardId,
      card: {
        size_x: 18,
        size_y: 12,
        series: addedSeriesCardId ? [{ id: addedSeriesCardId }] : [],
      },
    }).then(() => {
      return dashboardId;
    });
  });
}

async function showTooltipForFirstCircleInSeries(page, series_index) {
  await page.locator(`.sub._${series_index}`)
    .as("firstSeries")
    .locator("circle")
    .first()
    .dispatchEvent("mousemove", { force: true });
}

async function showTooltipForFirstBarInSeries(page, series_index) {
  await page.locator(`.sub._${series_index}`)
    .as("firstSeries")
    .locator(".bar")
    .first()
    .dispatchEvent("mousemove", { force: true });
}

async function testPairedTooltipValues(page, val1, val2) {
  await page.locator(`:text("${val1}")`).closest("td").sibling("td").locator(`:text("${val2}")`);
}

function testTooltipText(rowPairs = []) {
  popover().within(() => {
    rowPairs.forEach(([label, value]) => {
      testPairedTooltipValues(label, value);
    });
  });
}

async function openDashCardVisualizationOptions(page) {
  await page.locator('.Icon-pencil').click();
  await page.locator('.Card').hover();
  await page.locator('.Icon-palette').click();
}

async function updateColumnTitle(page, originalText, updatedText) {
  await page.locator(`:text("${originalText}")`).clear().type(updatedText).blur();
}

async function saveDashCardVisualizationOptions(page) {
  await page.locator('.Modal').within(() => {
    await page.locator(':text("Done")').click();
  });

  await saveDashboard(page);
}
