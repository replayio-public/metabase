import { restore, startNewQuestion } from "e2e/support/helpers";

const collectionName = "Parent";

const questions = {
  1: "Orders",
  2: "Orders, Count",
};


test.describe("issue 24660", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    createParentCollectionAndMoveQuestionToIt(1);
    createParentCollectionAndMoveQuestionToIt(2);
  });

  test("should properly show contents of different collections with the same name (metabase#24660)", async ({ page }) => {
    startNewQuestion();
    await page.locator('text="Saved Questions"').click();
    await page.locator(`[data-testid="tree-item-name"] >> text="${collectionName}"`).first().click();

    await page.locator(`text="${questions[1]}"`);
    await expect(page.locator(`text="${questions[2]}"`)).not.toBeVisible();
  });
});


async function createParentCollectionAndMoveQuestionToIt(questionId) {
  return cy
    .createCollection({
      name: collectionName,
      parent_id: null,
    })
    .then(({ body: { id } }) => {
      cy.request("PUT", `/api/card/${questionId}`, {
        collection_id: id,
      });
    });
}
