import { restore, openReviewsTable, modal } from "e2e/support/helpers";

test.describe("visual tests > visualizations > table", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await page.setViewportSize({ width: 1600, height: 860 });
    await cy.signInAsNormalUser();

    openReviewsTable();

    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('ad-hoc with long column trimmed', async ({ page }) => {
    // cy.createPercySnapshot();
  });

  test('ad-hoc with long column expanded', async ({ page }) => {
    await page.locator('[data-testid="expand-column"]').nth(0).click({ force: true });

    // cy.createPercySnapshot();
  });

  test('saved', async ({ page }) => {
    saveQuestion();
    // cy.createPercySnapshot();
  });
});

async function saveQuestion() {
  await page.route("POST", "/api/card", (route) => route.fulfill({ status: 200 })).as("saveQuestion");

  await page.locator('text="Save"').click();

  modal().within(() => {
    await page.locator('button="Save"').click();
    await page.waitForResponse("@saveQuestion");
  });

  modal().findByText("Not now").click();
}
