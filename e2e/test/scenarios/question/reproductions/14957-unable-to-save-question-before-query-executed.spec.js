import { restore, modal, openNativeEditor } from "e2e/support/helpers";

const PG_DB_NAME = "QA Postgres12";

describe.skip("issue 14957", { tags: "@external" }, test('should save a question before query has been executed (metabase#14957)', async ({ page }) => {
  await restore("postgres-12");
  await cy.signInAsAdmin();

  await openNativeEditor({ databaseName: PG_DB_NAME });
  await page.keyboard.type("select pg_sleep(60)");

  await page.locator('text="Save"').click();

  await page.locator('input[aria-label="Name"]').fill("14957");
  await page.locator('button:text("Save")').click();

  await expect(modal()).not.toBeVisible();
});
