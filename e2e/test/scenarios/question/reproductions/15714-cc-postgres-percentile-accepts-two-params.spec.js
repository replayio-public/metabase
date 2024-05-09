import {
  enterCustomColumnDetails,
  restore,
  startNewQuestion,
} from "e2e/support/helpers";

const PG_DB_NAME = "QA Postgres12";


test.describe("postgres > question > custom columns", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore("postgres-12");
    await signInAsAdmin();

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await test.page.locator('text=PG_DB_NAME').click();
    await test.page.locator('text=Orders').click();
  });

  test('`Percentile` custom expression function should accept two parameters (metabase#15714)', async () => {
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await test.page.locator('text=Pick the metric you want to see').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await test.page.locator('text=Custom Expression').click();
    enterCustomColumnDetails({ formula: "Percentile([Subtotal], 0.1)" });
    await test.page.locator('placeholder=Something nice and descriptive')
      .as("description")
      .click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(test.page.locator('text=Function Percentile expects 1 argument')).not.toBeVisible();
    await test.page.locator('@description').type("A");
    await test.page.locator('text=Done').isEnabled().click();
    // Todo: Add positive assertions once this is fixed
  });
});
