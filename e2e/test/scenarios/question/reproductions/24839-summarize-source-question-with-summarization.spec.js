import { restore, visitQuestionAdhoc, popover } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "24839",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [
      ["sum", ["field", ORDERS.QUANTITY, null]],
      ["avg", ["field", ORDERS.TOTAL, null]],
    ],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  display: "line",
};


test.describe("issue 24839: should be able to summarize a nested question based on the source question with aggregations (metabase#24839)", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails).then(({ body: { id } }) => {
      // Start ad-hoc nested question based on the saved one
      visitQuestionAdhoc({
        dataset_query: {
          database: SAMPLE_DB_ID,
          query: { "source-table": `card__${id}` },
          type: "query",
        },
      });
    });
  });

  test.skip("from the notebook GUI (metabase#24839-1)", async ({ page }) => {
    await page.locator('.Icon[name="notebook"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Summarize")').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Sum of ...")').click();
    popover()
      .should("contain", "Sum of Quantity")
      .and("contain", "Average of Total");
  });

  test("from a table header cell (metabase#24839-2)", async ({ page }) => {
    await page.locator('[data-testid="header-cell"]').locator(':text("Average of Total")').click();

    popover().contains("Distinct values").click();

    await expect(page.locator('.ScalarValue').textContent()).toEqual("49");

    await expect(page.locator('[data-testid="aggregation-item"]').textContent()).toEqual("Distinct values of Average of Total");
  });
});

