import { restore, popover } from "e2e/support/helpers";


test.describe("issue 22730", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(
      {
        name: "22730",
        native: {
          query: `select '14:02:13'::time "time", 'before-row' "name" union all select '14:06:13'::time "time", 'after-row' `,
        },
      },
      { visitQuestion: true },
    );

    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test("allows filtering by time column (metabase#22730)", async ({ page }) => {
    await page.click('text="Explore results"');
    await page.waitForResponse("/api/dataset");

    await page.locator('text="time"').click();

    popover().within(() => {
      page.click('text="Filter by this column"');

      page.locator('[data-testid="hours-input"]').fill("14").blur();

      page.locator('[data-testid="minutes-input"]').fill("03").blur();

      page.click('text="Add filter"');
    });

    await page.locator('text="before-row"');
    await expect(page.locator('text="after-row"')).not.toBeVisible();
  });
});
