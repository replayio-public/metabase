import {
  restore,
  openReviewsTable,
  popover,
  summarize,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS } = SAMPLE_DATABASE;


test.describe("issue 17768", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    await test.request("PUT", `/api/field/${REVIEWS.ID}`, {
      semantic_type: "type/Category",
      has_field_values: "list",
    });

    // Sync "Sample Database" schema
    await test.request("POST", `/api/database/${SAMPLE_DB_ID}/sync_schema`);

    waitForSyncToFinish();

    await test.request("PUT", `/api/field/${REVIEWS.ID}`, {
      semantic_type: "type/PK",
      has_field_values: "none",
    });
  });

  test("should not show binning options for an entity key, regardless of its underlying type (metabase#17768)", async ({ page }) => {
    openReviewsTable({ mode: "notebook" });

    summarize({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Pick a column to group by"');

    popover().within(() => {
      page.locator('text="ID"')
        .closest(".List-section")
        .realHover()
        .contains("Auto bin")
        .should("not.exist");
    });
  });
});


async function waitForSyncToFinish(iteration = 0) {
  // 100 x 100ms should be plenty of time for the sync to finish.
  // If it doesn't, we have a much bigger problem than this issue.
  if (iteration === 100) {
    return;
  }

  const { fingerprint } = await test.request("GET", `/api/field/${REVIEWS.ID}`);
  if (fingerprint === null) {
    await new Promise(resolve => setTimeout(resolve, 100));

    waitForSyncToFinish(++iteration);
  }

  return;
}

