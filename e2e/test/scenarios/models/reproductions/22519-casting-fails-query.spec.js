import { restore } from "e2e/support/helpers";
import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

import { turnIntoModel } from "../helpers/e2e-models-helpers";

const { REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

const ratingDataModelUrl = `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${REVIEWS_ID}/field/${REVIEWS.RATING}/general`;

const questionDetails = {
  query: {
    "source-table": REVIEWS_ID,
  },
};

describe.skip("issue 22519", (() => {
  test.beforeEach(async ({ page }) => {
    await intercept("PUT", "/api/field/*", "updateField");
    await intercept("POST", "/api/dataset", "dataset");

    restore();
    await signInAsAdmin();

    await page.goto(ratingDataModelUrl);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Don't cast").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=UNIX seconds → Datetime").click();
    await page.waitForResponse("@updateField");
  });

  test("model query should not fail when data model is using casting (metabase#22519)", async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=xavier");

    turnIntoModel();

    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=xavier");
  });
}));
