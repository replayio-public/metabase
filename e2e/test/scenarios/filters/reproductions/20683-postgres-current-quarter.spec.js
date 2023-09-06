import { restore, visualize } from "e2e/support/helpers";


test.describe("issue 20683", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore("postgres-12");
    cy.signInAsAdmin();

    await page.goto("/");
    await page.locator('text="New"').click();
    await page.locator('text="Question"').shouldBeVisible().click();

    await page.locator('text="QA Postgres12"').click();
    await page.locator('text="Orders"').click();
  });

  test("should filter postgres with the 'current quarter' filter (metabase#20683)", async ({ page }) => {
    await page.locator('text="Add filters to narrow your answer"').click();

    await page.locator('text="Created At"').click();

    await page.locator('text="Relative dates..."').click();
    await page.locator('text="Past"').click({ force: true });
    await page.locator('text="Current"').click({ force: true });

    await page.locator('text="Quarter"').click();

    visualize();

    // We don't have entries for the current quarter so we expect no results
    await page.locator('text="No results!"');
  });
});
