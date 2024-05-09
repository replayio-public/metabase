import {
  restore,
  withDatabase,
  adhocQuestionHash,
  runNativeQuery,
} from "e2e/support/helpers";

const PG_DB_ID = 2;

const questionDetails = {
  dataset_query: {
    type: "native",
    database: PG_DB_ID,
    native: {
      query: "SELECT pg_sleep(10)",
    },
  },
};


test.describe("issue 11727", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore("postgres-12");
    cy.signInAsAdmin();
    cy.intercept("GET", "/api/database").as("getDatabases");
  });

  test("should cancel the native query via the keyboard shortcut (metabase#11727)", async ({ page }) => {
    withDatabase(PG_DB_ID, () => {
      await page.goto(`/question#` + adhocQuestionHash(questionDetails));
      await page.waitForResponse("@getDatabases");

      runNativeQuery({ wait: false });
      await expect(page.locator("text=Doing science...")).toBeVisible();
      await page.keyboard.down('Meta');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Meta');
      await expect(page.locator("text=Here's where your results will appear")).toBeVisible();
    });
  });
});

