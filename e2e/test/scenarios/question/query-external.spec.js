import { restore, startNewQuestion, visualize } from "e2e/support/helpers";

const supportedDatabases = [
  {
    database: "Mongo",
    snapshotName: "mongo-4",
    dbName: "QA Mongo4",
  },
  {
    database: "MySQL",
    snapshotName: "mysql-8",
    dbName: "QA MySQL8",
  },
];

supportedDatabases.forEach(({ database, snapshotName, dbName }) => {
  test.describe("scenarios > question > query > external", () => {
    test.beforeEach(async () => {
      cy.intercept("POST", "/api/dataset").as("dataset");

      restore(snapshotName);
      cy.signInAsAdmin();
    });

    test(`can query ${database} database`, async ({ page }) => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(`text=${dbName}`).click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(`text=Orders`).click();

      visualize();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=37.65')).toBeVisible();
    });
  });
});
