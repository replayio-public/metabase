import { restore, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const filter = {
  id: "7795c137-a46c-3db9-1930-1d690c8dbc03",
  name: "filter",
  "display-name": "Filter",
  type: "dimension",
  dimension: ["field", PRODUCTS.CATEGORY, null],
  "widget-type": "string/=",
  default: null,
};


test.describe("issue 16739", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  ["normal", "nodata"].forEach(user => {
    //Very related to the metabase#15981, only this time the issue happens with the "Field Filter" without the value being set.
    test(`filter feature flag shouldn't cause run-overlay of results in native editor for ${user} user (metabase#16739)`, async ({ page }) => {
      const questionId = await createNativeQuestion({
        native: {
          query: "select * from PRODUCTS where {{ filter }}",
          "template-tags": { filter },
        },
      });

      if (user === "nodata") {
        await signOut();
        await signIn(user);
      }

      await visitQuestion(questionId);

      await expect(page.locator('icon[name="play"]')).not.toBeVisible();
    });
  });
});

