import { restore, popover, visualize } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "20229",
  type: "query",
  query: {
    "source-table": ORDERS_ID,
    expressions: {
      Adjective: [
        "case",
        [[[">", ["field", ORDERS.TOTAL, null], 100], "expensive"]],
        { default: "cheap" },
      ],
    },
    limit: 10,
  },
};


test.describe("issue 20229", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    await createQuestion(questionDetails, { visitQuestion: true });
  });

  test("should display custom column regardless of how many columns are selected (metabase#20229)", async () => {
    ccAssertion();

    // Switch to the notebook view to deselect at least one column
    await page.locator('.Icon[name="notebook"]').click();

    await page.locator('[data-testid="fields-picker"]').click();
    await popover().within(() => {
      unselectColumn("Tax");
    });

    visualize();

    ccAssertion();
  });
});



async function ccAssertion() {
  await page.locator(':text("Adjective")');
  await page.locator(':text("expensive")');
  await page.locator(':text("cheap")');
}



async function unselectColumn(column) {
  await page.locator(`:text("${column}")`).sibling().locator('.Icon-check').click({ force: true });
}

