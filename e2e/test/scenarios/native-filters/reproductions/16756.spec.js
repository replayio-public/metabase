import { restore, filterWidget, popover } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

import { runQuery } from "../helpers/e2e-sql-filter-helpers";

const { PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "16756",
  native: {
    query: "select * from PRODUCTS where {{filter}}",
    "template-tags": {
      filter: {
        id: "d3643bc3-a8f3-e015-8c83-d2ea50bfdf22",
        name: "filter",
        "display-name": "Filter",
        type: "dimension",
        dimension: ["field", PRODUCTS.CREATED_AT, null],
        "widget-type": "date/range",
        default: null,
      },
    },
  },
};


test.describe("issue 16756", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset").as("dataset");

    restore();
    await signInAsAdmin();

    await createNativeQuestion(questionDetails).then(({ body: { id } }) => {
      intercept("POST", `/api/card/**/${id}/query`).as("cardQuery");

      visit(`/question/${id}?filter=2018-03-31~2019-03-31`);

      waitFor("@cardQuery");
    });
  });

  test("should allow switching between date filter types (metabase#16756)", async ({ page }) => {
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await findByText(/Open editor/i).click();
    await icon("variable").click();

    // Update the filter widget type
    await findByTestId("sidebar-right").findByText("Date Range").click();

    popover().contains("Single Date").click();

    // The previous filter value should reset
    await location("search").should("eq", "");

    // Set the date to the 15th of whichever the month and year are when this tests runs
    filterWidget().click();

    popover().contains("15").click();

    await button("Update filter").click();

    runQuery();

    // We expect "No results"
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await findByText("No results!");
  });
});

