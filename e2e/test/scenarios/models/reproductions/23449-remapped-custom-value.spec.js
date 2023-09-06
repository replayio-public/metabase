import { restore, openQuestionActions } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

const questionDetails = { query: { "source-table": REVIEWS_ID, limit: 2 } };


test.describe("issue 23449", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    await request("POST", `/api/field/${REVIEWS.RATING}/dimension`, {
      type: "internal",
      name: "Rating",
    });

    await request("POST", `/api/field/${REVIEWS.RATING}/values`, {
      values: [
        [1, "Awful"],
        [2, "Unpleasant"],
        [3, "Meh"],
        [4, "Enjoyable"],
        [5, "Perfecto"],
      ],
    });
  });

  test("should work with the remapped custom values from data model (metabase#23449)", async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });
    await page.locator('text=Perfecto').isVisible();

    turnIntoModel();
    await page.locator('text=Perfecto').isVisible();
  });
});

async function turnIntoModel() {
  const cardUpdate = await page.route('PUT', '/api/card/*');

  openQuestionActions();
  await page.locator('text=Turn into a model').click();
  await page.locator('text=Turn this into a model').click();

  const response = await cardUpdate.waitFor();
  expect(response.body.error).not.toBeDefined();
}
