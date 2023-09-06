import { restore, saveDashboard } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;


test.describe("adding an additional series to a dashcard (metabase#20637)", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should use the correct query endpoints (metabase#20637)', async ({ page }) => {
    createQuestionsAndDashboard();
    await page.waitForResponse("@dashcardQuery");

    // edit the dashboard and open the add series modal
    await page.locator('.Icon-pencil').click();
    // the button is made clickable by css using :hover so we need to force it
    await page.locator('[data-testid="add-series-button"]').click({ force: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("20637 Question 2")').click();
    // make sure the card query endpoint was used
    await page.waitForResponse("@additionalSeriesCardQuery");

    await page.locator('.AddSeriesModal').within(async () => {
      await page.locator(':text("Done")').click();
    });
    saveDashboard();

    // refresh the page and make sure the dashcard query endpoint was used
    await page.reload();
    await page.waitForResponse(["@dashcardQuery", "@additionalSeriesDashcardQuery"]);
  });
});



async function createQuestionsAndDashboard() {
  const dashcardQuestion = {
    name: "20637 Question 1",
    query: {
      "source-table": PRODUCTS_ID,
      aggregation: [["count"]],
      breakout: [["field", PRODUCTS.CATEGORY, null]],
    },
    visualization_settings: {
      "graph.dimensions": ["CATEGORY"],
      "graph.metrics": ["count"],
    },
    display: "line",
  };

  const additionalSeriesQuestion = {
    name: "20637 Question 2",
    query: {
      "source-table": PRODUCTS_ID,
      aggregation: [["count"]],
      breakout: [["field", PRODUCTS.CATEGORY, null]],
    },
    visualization_settings: {
      "graph.dimensions": ["CATEGORY"],
      "graph.metrics": ["count"],
    },
    display: "bar",
  };

  cy.createQuestion(additionalSeriesQuestion).then(
    async ({ body: { id: additionalSeriesId } }) => {
      cy.intercept("POST", `/api/card/${additionalSeriesId}/query`).as(
        "additionalSeriesCardQuery",
      );

      cy.createQuestionAndDashboard({ questionDetails: dashcardQuestion }).then(
        async ({ body: { id, card_id, dashboard_id } }) => {
          await cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
            cards: [
              {
                id,
                card_id,
                row: 0,
                col: 0,
                size_x: 12,
                size_y: 10,
              },
            ],
          });

          await cy.visit(`/dashboard/${dashboard_id}`);

          cy.intercept(
            "POST",
            `/api/dashboard/${dashboard_id}/dashcard/*/card/${card_id}/query`,
          ).as("dashcardQuery");

          cy.intercept(
            "POST",
            `/api/dashboard/${dashboard_id}/dashcard/*/card/${additionalSeriesId}/query`,
          ).as("additionalSeriesDashcardQuery");
        },
      );
    },
  );
}

