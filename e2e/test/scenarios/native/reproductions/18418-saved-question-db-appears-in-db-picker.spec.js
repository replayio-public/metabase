import {
  restore,
  POPOVER_ELEMENT,
  openNativeEditor,
} from "e2e/support/helpers";

const questionDetails = {
  name: "REVIEWS SQL",
  native: { query: "select REVIEWER from REVIEWS LIMIT 1" },
};


test.describe("issue 18418", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/card");
    await restore();
    await signInAsAdmin();
  });

  test("should not show saved questions DB in native question's DB picker (metabase#18418)", async ({ page }) => {
    await createNativeQuestion(questionDetails, { visitQuestion: true });

    await page.locator('text="Explore results"').click();

    await page.locator('text="Save"').click();

    await page.locator('.Modal').locator('button="Save"').click();

    await page.locator('button="Not now"').click();

    await openNativeEditor({ fromCurrentPage: true });

    // Clicking native question's database picker usually opens a popover with a list of databases
    // As default Playwright environment has only the sample database available, we expect no popup to appear
    await expect(page.locator(POPOVER_ELEMENT)).not.toBeVisible();
  });
});

