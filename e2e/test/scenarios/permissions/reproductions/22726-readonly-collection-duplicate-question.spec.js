import {
  restore,
  popover,
  visitQuestion,
  openQuestionActions,
  getFullName,
} from "e2e/support/helpers";
import { USERS, USER_GROUPS } from "e2e/support/cypress_data";

const { nocollection } = USERS;

const { ALL_USERS_GROUP } = USER_GROUPS;


test.describe("issue 22726", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");
    context.intercept("POST", "/api/card").as("createCard");

    restore();
    cy.signInAsAdmin();

    // Let's give all users a read only access to "Our analytics"
    cy.updateCollectionGraph({
      [ALL_USERS_GROUP]: { root: "read" },
    });

    cy.signIn("nocollection");
  });

  test('should offer to duplicate a question in a view-only collection (metabase#22726)', async ({ page }) => {
    visitQuestion(1);

    openQuestionActions();
    await popover().findByText("Duplicate").click();
    await page.locator('text=ensureVisible').withText(`${getFullName(nocollection)}'s Personal Collection`);

    await page.locator('button').withText("Duplicate").click();
    await page.waitForResponse("@createCard");
  });
});

