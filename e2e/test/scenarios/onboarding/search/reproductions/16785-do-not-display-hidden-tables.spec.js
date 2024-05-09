import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS_ID } = SAMPLE_DATABASE;

describe.skip("issue 16785", (() => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.request("PUT", "/api/table", {
      ids: [REVIEWS_ID],
      visibility_type: "hidden",
    });
  });

  test('should not display hidden tables (metabase#16785)', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[placeholder="Search…"]').fill('Reviews');

    await page.locator('[data-testid="search-results-list"]').within(() => {
      expect(page.locator('text=Reviews')).not.toBeVisible();
    });
  });
}));
