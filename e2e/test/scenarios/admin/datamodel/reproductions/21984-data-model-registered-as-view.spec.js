import { restore } from "e2e/support/helpers";

import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS_ID } = SAMPLE_DATABASE;

const reviewsDataModelPage = `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${REVIEWS_ID}`;


test.describe("issue 21984", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("GET", "/api/table/*/query_metadata?**", "tableMetadata");

    restore();
    await signInAsAdmin();

    await page.goto(reviewsDataModelPage);
    await page.waitForResponse("@tableMetadata");

    await page.locator('input[displayValue="ID"]');
  });

  test('should not show data model visited tables in search or in "Pick up where you left off" items on homepage (metabase#21984)', async ({ page }) => {
    await page.goto("/");

    await page.locator('text="Metabase tips"');
    await expect(page.locator('text="Pick up where you left off"')).not.toBeVisible();

    await page.locator('input[placeholder="Search…"]').click();
    await page.locator('text="Recently viewed"');
    await page.locator('text="Nothing here"');
  });
});
