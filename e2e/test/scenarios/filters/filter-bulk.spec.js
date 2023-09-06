import {
  popover,
  restore,
  visitQuestionAdhoc,
  setupBooleanQuery,
  filter,
  filterField,
  filterFieldPopover,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS, PEOPLE_ID, PRODUCTS_ID } = SAMPLE_DATABASE;

const rawQuestionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": ORDERS_ID,
    },
  },
};

const peopleQuestion = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": PEOPLE_ID,
    },
  },
};

const productsQuestion = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": PRODUCTS_ID,
    },
  },
};

const filteredQuestionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      filter: [
        "and",
        [">", ["field", ORDERS.QUANTITY, null], 20],
        ["<", ["field", ORDERS.QUANTITY, null], 30],
      ],
    },
  },
};

const aggregatedQuestionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": ORDERS_ID,
      breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
      aggregation: [["count"]],
    },
  },
};

test.describe("scenarios > filters > bulk filtering", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test("should sort database fields by relevance", async ({ page }) => {
    visitQuestionAdhoc(rawQuestionDetails);
    filter();

    modal().within(() => {
      cy.findAllByTestId(/filter-field-/)
        .eq(0)
        .should("include.text", "Created At");

      cy.findAllByTestId(/filter-field-/)
        .eq(1)
        .should("include.text", "Discount");

      cy.findAllByTestId(/filter-field-/)
        .last()
        .should("include.text", "ID");
    });
  });

  // ... (rest of the tests)
});

const modal = () => {
  return cy.get(".Modal");
};

const applyFilters = () => {
  modal().within(() => {
    cy.findByTestId("apply-filters").click();
  });

  cy.wait("@dataset");
};
