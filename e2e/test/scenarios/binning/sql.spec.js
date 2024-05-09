import {
  restore,
  snapshot,
  visualize,
  changeBinningForDimension,
  summarize,
  startNewQuestion,
} from "e2e/support/helpers";

const questionDetails = {
  name: "SQL Binning",
  native: {
    query:
      "SELECT ORDERS.CREATED_AT, ORDERS.TOTAL, PEOPLE.LONGITUDE FROM ORDERS JOIN PEOPLE ON orders.user_id = people.id",
  },
};


test.describe("scenarios > binning > from a saved sql question", () => {
  test.beforeAll(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(questionDetails, { loadMetadata: true });

    snapshot("binningSql");
  });

  test.beforeEach(async () => {
    cy.intercept("POST", "/api/dataset").as("dataset");

    restore("binningSql");
    cy.signInAsAdmin();
  });

  test.describe("via simple question", () => {
    test.beforeEach(async () => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Saved Questions").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("SQL Binning").click();
      visualize();
      cy.findByTextEnsureVisible("LONGITUDE");
      summarize();
    });

    test("should work for time series", async () => {
      /*
       * If `result_metadata` is not loaded (SQL question is not run before saving),
       * the granularity is much finer and one can see "by minute" as the default bucket (metabase#16671).
       */
      changeBinningForDimension({
        name: "CREATED_AT",
        fromBinning: "by month",
        toBinning: "Year",
      });

      waitAndAssertOnRequest("@dataset");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by CREATED_AT: Year");
      cy.get("circle");
    });

    test("should work for number", async () => {
      changeBinningForDimension({
        name: "TOTAL",
        fromBinning: "Auto bin",
        toBinning: "50 bins",
      });

      waitAndAssertOnRequest("@dataset");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by TOTAL: 50 bins");
      cy.get(".bar");
    });

    test("should work for longitude", async () => {
      changeBinningForDimension({
        name: "LONGITUDE",
        fromBinning: "Auto bin",
        toBinning: "Bin every 10 degrees",
      });

      waitAndAssertOnRequest("@dataset");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by LONGITUDE: 10°");
      cy.get(".bar");
    });
  });

  test.describe("via custom question", () => {
    test.beforeEach(async () => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Saved Questions").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("SQL Binning").click();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Pick the metric you want to see").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count of rows").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Pick a column to group by").click();
    });

    test("should work for time series", async () => {
      changeBinningForDimension({
        name: "CREATED_AT",
        fromBinning: "by month",
        toBinning: "Year",
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by CREATED_AT: Year");

      visualize(response => {
        assertOnResponse(response);
      });

      cy.get("circle");
    });

    test("should work for number", async () => {
      changeBinningForDimension({
        name: "TOTAL",
        fromBinning: "Auto bin",
        toBinning: "50 bins",
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by TOTAL: 50 bins");

      visualize(response => {
        assertOnResponse(response);
      });

      cy.get(".bar");
    });

    test("should work for longitude", async () => {
      changeBinningForDimension({
        name: "LONGITUDE",
        fromBinning: "Auto bin",
        toBinning: "Bin every 10 degrees",
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by LONGITUDE: 10°");

      visualize(response => {
        assertOnResponse(response);
      });

      cy.get(".bar");
    });
  });

  test.describe("via column popover", () => {
    test.beforeEach(async () => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Saved Questions").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("SQL Binning").click();
      visualize();
      cy.findByTextEnsureVisible("LONGITUDE");
    });

    test("should work for time series", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("CREATED_AT").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Distribution").click();

      assertOnXYAxisLabels({ xLabel: "CREATED_AT", yLabel: "Count" });
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by CREATED_AT: Month");
      cy.get("circle");

      // Open a popover with bucket options from the time series footer
      cy.findAllByTestId("select-button-content").contains("Month").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Quarter").click();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by CREATED_AT: Quarter");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Q1 - 2017");
    });

    test("should work for number", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("TOTAL").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Distribution").click();

      assertOnXYAxisLabels({ xLabel: "TOTAL", yLabel: "Count" });
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by TOTAL: Auto binned");
      cy.get(".bar");
    });

    test("should work for longitude", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("LONGITUDE").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Distribution").click();

      assertOnXYAxisLabels({ xLabel: "LONGITUDE", yLabel: "Count" });
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Count by LONGITUDE: Auto binned");
      cy.get(".bar");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("170° W");
    });
  });
});



async function assertOnXYAxisLabels({ xLabel, yLabel } = {}) {
  await expect(page.locator(".x-axis-label").textContent()).toBe(xLabel);

  await expect(page.locator(".y-axis-label").textContent()).toBe(yLabel);
}



async function waitAndAssertOnRequest(requestAlias) {
  const response = await page.waitForResponse(requestAlias);
  assertOnResponse(response);
}


function assertOnResponse(response) {
  expect(response.body.error).to.not.exist;
}
