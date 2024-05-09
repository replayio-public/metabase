import { restore, filter, summarize } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const ccTable = "Custom Created";
const ccFunction = "Custom Total";

const questionDetails = {
  name: "25189",
  query: {
    "source-table": ORDERS_ID,
    limit: 5,
    expressions: {
      [ccTable]: ["field", ORDERS.CREATED_AT, null],
      [ccFunction]: [
        "case",
        [[[">", ["field", ORDERS.TOTAL, null], 100], "Yay"]],
        {
          default: "Nay",
        },
      ],
    },
  },
};

describe.skip("issue 25189", (() => {
  test.beforeEach(async () => {
    test.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails).then(
      ({ body: { id: baseQuestionId } }) => {
        cy.createQuestion(
          {
            name: "Nested 25189",
            query: { "source-table": `card__${baseQuestionId}` },
          },
          { visitQuestion: true },
        );
      },
    );
  });

  test("custom column referencing only a single column should not be dropped in a nested question (metabase#25189)", async () => {
    // 1. Column should not be dropped
    await expect(page.locator('[data-testid="header-cell"]')).toHaveText(ccFunction);
    await expect(page.locator('[data-testid="header-cell"]')).toHaveText(ccTable);

    // 2. We shouldn't see duplication in the bulk filter modal
    filter();
    await page.locator('.Modal').within(async () => {
      // Implicit assertion - will fail if more than one element is found
      await expect(page.locator(':text(ccFunction)')).toHaveCount(1);
      await expect(page.locator(':text(ccTable)')).toHaveCount(1);

      await page.locator(':text("Today")').click();
      await page.locator(':text("Apply Filters")').click();
    });

    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(':text("No results!")')).toBeVisible();

    // 3. We shouldn't see duplication in the breakout fields
    summarize();
    await page.locator('[data-testid="sidebar-content"]').within(async () => {
      // Another implicit assertion
      await expect(page.locator(':text(ccFunction)')).toHaveCount(1);
      await expect(page.locator(':text(ccTable)')).toHaveCount(1);
    });
  });
});
