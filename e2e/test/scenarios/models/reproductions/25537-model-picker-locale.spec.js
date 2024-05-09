import { restore, startNewQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "Orders model",
  query: { "source-table": ORDERS_ID },
  dataset: true,
};


test.describe("issue 25537", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();
    await context.intercept("GET", "/api/collection/*/items?*").as("getCollectionContent");
  });

  test("should be able to pick a saved model when using a non-english locale (metabase#25537)", async ({ page, context }) => {
    setLocale("de");
    await context.createQuestion(questionDetails);

    startNewQuestion();
    await page.locator('icon("model")').click();
    await context.waitFor("@getCollectionContent");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(`text=${questionDetails.name}`)).toBeVisible();
  });
});

const setLocale = locale => {
  cy.request("GET", "/api/user/current").then(
  await context.request("PUT", `/api/user/${user_id}`, { locale });
  );
};
