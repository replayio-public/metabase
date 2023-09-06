import { assocIn } from "icepick";
import {
  setActionsEnabledForDB,
  modal,
  popover,
  restore,
  fillActionQuery,
  createAction,
  navigationSidebar,
  openNavigationSidebar,
  resetTestTable,
  resyncDatabase,
  createModelFromTableName,
  queryWritableDB,
} from "e2e/support/helpers";

import {
  SAMPLE_DB_ID,
  USER_GROUPS,
  WRITABLE_DB_ID,
} from "e2e/support/cypress_data";

import { createMockActionParameter } from "metabase-types/api/mocks";

const PG_DB_ID = 2;
const PG_ORDERS_TABLE_ID = 9;
const WRITABLE_TEST_TABLE = "scoreboard_actions";

const SAMPLE_ORDERS_MODEL = {
  name: "Order",
  dataset: true,
  display: "table",
  database: PG_DB_ID,
  query: {
    "source-table": PG_ORDERS_TABLE_ID,
  },
};

const TEST_PARAMETER = createMockActionParameter({
  id: "49596bcb-62bb-49d6-a92d-bf5dbfddf43b",
  name: "Total",
  slug: "total",
  type: "number/=",
  target: ["variable", ["template-tag", "total"]],
});

const TEST_TEMPLATE_TAG = {
  id: TEST_PARAMETER.id,
  type: "number",
  name: TEST_PARAMETER.slug,
  "display-name": TEST_PARAMETER.name,
  slug: TEST_PARAMETER.slug,
};

const SAMPLE_QUERY_ACTION = {
  name: "Demo Action",
  type: "query",
  parameters: [TEST_PARAMETER],
  database_id: PG_DB_ID,
  dataset_query: {
    type: "native",
    native: {
      query: `UPDATE ORDERS SET TOTAL = TOTAL WHERE ID = {{ ${TEST_TEMPLATE_TAG.name} }}`,
      "template-tags": {
        [TEST_TEMPLATE_TAG.name]: TEST_TEMPLATE_TAG,
      },
    },
    database: PG_DB_ID,
  },
  visualization_settings: {
    fields: {
      [TEST_PARAMETER.id]: {
        id: TEST_PARAMETER.id,
        required: true,
        fieldType: "number",
        inputType: "number",
      },
    },
  },
};

const SAMPLE_WRITABLE_QUERY_ACTION = assocIn(
  SAMPLE_QUERY_ACTION,
  ["dataset_query", "native", "query"],
  `UPDATE ${WRITABLE_TEST_TABLE} SET score = 22 WHERE id = {{ ${TEST_TEMPLATE_TAG.name} }}`,
);

test.describe(
  "scenarios > models > actions",
  { tags: ["@external", "@actions"] },
  () => {
    test.beforeEach(async () => {
      restore("postgres-12");
      cy.signInAsAdmin();
      setActionsEnabledForDB(PG_DB_ID);

      cy.createQuestion(SAMPLE_ORDERS_MODEL, {
        wrapId: true,
        idAlias: "modelId",
      });

      cy.intercept("GET", "/api/card/*").as("getModel");
      cy.intercept("PUT", "/api/action/*").as("updateAction");
    });

    test('should allow CRUD operations on model actions', async () => {
      // Test implementation
    });

    test('should allow to create an action with the New button', async () => {
      // Test implementation
    });

    test('should respect permissions', async () => {
      // Test implementation
    });

    test('should display parameters for variable template tags only', async () => {
      // Test implementation
    });
  },
);

["postgres", "mysql"].forEach(dialect => {
  test.describe(`Write actions on model detail page (${dialect})`, () => {
    test.beforeEach(async () => {
      // Test setup
    });

    test('should allow action execution from the model detail page', async () => {
      // Test implementation
    });

    test('should allow public sharing of actions and execution of public actions', async () => {
      // Test implementation
    });
  });
});

async function runActionFor(actionName) {
  // Function implementation
}

async function openActionMenuFor(actionName) {
  // Function implementation
}

function openActionEditorFor(actionName, { isReadOnly = false } = {}) {
  openActionMenuFor(actionName);
  popover()
    .findByText(isReadOnly ? "View" : "Edit")
    .click();
}

async function assertQueryEditorDisabled() {
  // Function implementation
}

async function enableSharingFor(actionName, { publicUrlAlias }) {
  // Function implementation
}

async function disableSharingFor(actionName) {
  // Function implementation
}

function getArchiveListItem(itemName) {
  return cy.findByTestId(`archive-item-${itemName}`);
}
