import _ from "underscore";
import { snapshot, restore, withSampleDatabase } from "e2e/support/helpers";
import {
  USERS,
  USER_GROUPS,
  SAMPLE_DB_ID,
  SAMPLE_DB_TABLES,
  METABASE_SECRET_KEY,
} from "e2e/support/cypress_data";

const {
  STATIC_ORDERS_ID,
  STATIC_PRODUCTS_ID,
  STATIC_REVIEWS_ID,
  STATIC_PEOPLE_ID,
  STATIC_ACCOUNTS_ID,
  STATIC_ANALYTIC_EVENTS_ID,
  STATIC_FEEDBACK_ID,
  STATIC_INVOICES_ID,
} = SAMPLE_DB_TABLES;

const {
  ALL_USERS_GROUP,
  COLLECTION_GROUP,
  DATA_GROUP,
  READONLY_GROUP,
  NOSQL_GROUP,
} = USER_GROUPS;
const { admin } = USERS;

test.describe("snapshots", () => {
  test.describe("default", () => {
    test('default', async () => {
      snapshot("blank");
      setup();
      updateSettings();
      snapshot("setup");
      addUsersAndGroups();
      createCollections();
      withSampleDatabase(SAMPLE_DATABASE => {
        ensureTableIdsAreCorrect(SAMPLE_DATABASE);
        hideNewSampleTables(SAMPLE_DATABASE);
        createQuestionsAndDashboards(SAMPLE_DATABASE);
        cy.writeFile(
          "e2e/support/cypress_sample_database.json",
          SAMPLE_DATABASE,
        );
      });

      snapshot("default");

      restore("blank");
    });
  });

  async function setup() {
    // ... (keep the existing code inside the function)
  }

  async function updateSettings() {
    // ... (keep the existing code inside the function)
  }

  async function addUsersAndGroups() {
    // ... (keep the existing code inside the function)
  }

  async function createCollections() {
    // ... (keep the existing code inside the function)
  }

  async function createQuestionsAndDashboards({ ORDERS, ORDERS_ID }) {
    // ... (keep the existing code inside the function)
  }

  async function ensureTableIdsAreCorrect({
    // ... (keep the existing code inside the function)
  }) {
    // ... (keep the existing code inside the function)
  }

  async function hideNewSampleTables({
    // ... (keep the existing code inside the function)
  }) {
    // ... (keep the existing code inside the function)
  }

  test.describe("withSqlite", () => {
    test('withSqlite', async () => {
      // ... (keep the existing code inside the function)
    });
  });
});
