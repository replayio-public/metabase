import { restore, startNewQuestion, popover } from "e2e/support/helpers";


test.describe("issue 22285", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();

    context.intercept("GET", "/api/database").as("fetchDatabases");

    context.intercept("GET", "/api/database/*/schemas", {
      body: ["PUBLIC", "FAKE SCHEMA"],
    });
  });

  test("should not clean DB schemas list in the data selector (metabase#22285)", async ({ page, context }) => {
    startNewQuestion();
    await context.waitFor("@fetchDatabases");

    await popover().within(async () => {
      await page.locator('text="Sample Database"').click();

      await page.locator('text=/Fake Schema/i');
      await page.locator('text=/Public/i').click();
      await page.locator('text="Orders"');

      // go back to database picker
      await page.locator('icon="chevronleft"').click();

      await page.locator('text=/Fake Schema/i');
      await page.locator('text=/Public/i');
    });
  });
});
