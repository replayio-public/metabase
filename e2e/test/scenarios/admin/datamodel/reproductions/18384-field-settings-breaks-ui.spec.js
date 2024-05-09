import { restore } from "e2e/support/helpers";
import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE_ID, PEOPLE, REVIEWS_ID } = SAMPLE_DATABASE;


test.describe("issue 18384", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();

    // Hide Reviews table
    await context.request("PUT", "/api/table", {
      ids: [REVIEWS_ID],
      visibility_type: "hidden",
    });
  });

  test("should be able to open field properties even when one of the tables is hidden (metabase#18384)", async ({ page, context }) => {
    await page.goto(
      `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${PEOPLE_ID}`,
    );

    await page.locator('[data-testid="column-ADDRESS"] .Icon-gear').click();

    await expect(page).toHaveURLPath(
      `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${PEOPLE_ID}/field/${PEOPLE.ADDRESS}/general`,
    );

    await page.locator(':text("Address – Field Settings")');
  });
});

