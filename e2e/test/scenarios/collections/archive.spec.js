import { getCollectionIdFromSlug, restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE_ID } = SAMPLE_DATABASE;

const getQuestionDetails = collectionId => ({
  name: "A question",
  query: { "source-table": PEOPLE_ID },
  collection_id: collectionId,
});


test.describe("scenarios > collections > archive", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should load initially hidden archived items on scroll (metabase#24213)", async ({ page }) => {
    const stubbedItems = Array.from({ length: 50 }, (v, i) => ({
      name: "Item " + i,
      id: i + 1,
      model: "card",
    }));

    page.route("GET", "/api/search?archived=true", (route, request) => {
      route.fulfill({
        status: 200,
        body: {
          data: stubbedItems,
        },
      });
    });

    await page.goto("/archive");

    await page.locator("main").scrollTo("bottom");
    await page.locator(':text("Item 40")');
  });

  test("shows correct page when visiting page of question that was in archived collection (metabase##23501)", async ({ page }) => {
    getCollectionIdFromSlug("first_collection", async (collectionId) => {
      const questionDetails = getQuestionDetails(collectionId);

      const questionId = await createQuestion(page, questionDetails);

      await page.request("PUT", `/api/collection/${collectionId}`, {
        archived: true,
      });

      // Question belonging to collection
      // will have been archived,
      // and archived page should be displayed
      await page.goto(`/question/${questionId}`);
      await page.locator("text='This question has been archived'");
    });
  });
});

