import {
  restore,
  openQuestionActions,
  summarize,
  sidebar,
} from "e2e/support/helpers";


test.describe("issue 22518", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await createNativeQuestion(
      {
        native: {
          query: "select 1 id, 'a' foo",
        },
        dataset: true,
      },
      { visitQuestion: true },
      page,
    );
  });

  test("UI should immediately reflect model query changes upon saving (metabase#22518)", async ({ page }) => {
    await openQuestionActions(page);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Edit query definition"');

    await page.locator(".ace_content").type(", 'b' bar");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Save changes"');

    await expect(page.locator('[data-testid="header-cell"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="header-cell"]')).toContainText("BAR");

    await summarize(page);

    await sidebar(page)
      .expect(page.locator('text="ID"')).toBeVisible()
      .expect(page.locator('text="FOO"')).toBeVisible()
      .expect(page.locator('text="BAR"')).toBeVisible();
  });
});

