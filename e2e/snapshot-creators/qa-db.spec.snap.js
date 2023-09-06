import {
  restore,
  snapshot,
  addPostgresDatabase,
  addMongoDatabase,
  addMySQLDatabase,
  setupWritableDB,
} from "e2e/support/helpers";

test.describe("qa databases snapshots", () => {
  test.beforeEach(async ({ page }) => {
    restoreAndAuthenticate();
  });

  test('creates snapshots for supported qa databases', async ({ page }) => {
    addPostgresDatabase();
    snapshot("postgres-12");
    deleteDatabase("postgresID");

    restoreAndAuthenticate();

    addMySQLDatabase();
    snapshot("mysql-8");
    deleteDatabase("mysqlID");

    restoreAndAuthenticate();

    addMongoDatabase();
    snapshot("mongo-4");
    deleteDatabase("mongoID");

    restoreAndAuthenticate();

    setupWritableDB("mysql");
    addMySQLDatabase("Writable MySQL8", true);
    snapshot("mysql-writable");
    deleteDatabase("mysqlID");

    restoreAndAuthenticate();

    setupWritableDB("postgres");
    addPostgresDatabase("Writable Postgres12", true);
    snapshot("postgres-writable");
    deleteDatabase("postgresID");

    restore("blank");
  });
});

async function restoreAndAuthenticate() {
  restore("default");
  await cy.signInAsAdmin();
}

async function deleteDatabase(idAlias) {
  const id = await page.locator(`@${idAlias}`).textContent();
  await page.request("DELETE", `/api/database/${id}`);
}
