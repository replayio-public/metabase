import {
  restore,
  openOrdersTable,
  modal,
  questionInfoButton,
  rightSidebar,
} from "e2e/support/helpers";


test.describe("issue 17910", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsNormalUser(page);
  });

  test("revisions should work after creating a question without reloading (metabase#17910)", async ({ page }) => {
    await openOrdersTable(page);
    await page.locator('text="Save"').click();
    await modal(page).within(async () => {
      await page.locator('text="Save"').click();
    });
    await page.waitForResponse("POST", `/api/card`);
    await modal(page).within(async () => {
      await page.locator('text="Not now"').click();
    });

    await questionInfoButton(page).click();

    await rightSidebar(page).within(async () => {
      await page.locator('placeholder="Add description"')
        .fill("A description")
        .blur();
      await page.locator('text="History"');
      await expect(page.locator('[data-testid="saved-question-history-list"]').children()).toHaveCount(2);
    });
  });
});

