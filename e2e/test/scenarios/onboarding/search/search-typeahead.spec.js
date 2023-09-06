import { restore } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

["admin", "normal"].forEach(user => {
  test.describe(`search > ${user} user`, () => {
    test.beforeEach(async ({ context }) => {
      restore();
      await context.signIn(user);
      await context.page.goto("/");
    });

    // There was no issue for this, but it was implemented in pull request #15614
    test("should be able to use typeahead search functionality", async ({ page }) => {
      const personalCollectionsLength =
        user === "admin" ? Object.entries(USERS).length : 1;

      await page.locator('input[placeholder="Search…"]').fill("pers");
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
      await page.locator('[data-testid="search-results-list"]').within(async () => {
        await expect(page.locator('text=/personal collection$/i')).toHaveCount(personalCollectionsLength);
      });
    });
  });
});
