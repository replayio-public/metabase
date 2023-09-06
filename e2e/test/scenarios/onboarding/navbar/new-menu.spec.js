import { restore, popover, modal } from "e2e/support/helpers";


test.describe("metabase > scenarios > navbar > new menu", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await page.goto("/");
    await page.locator('text="New"').click();
  });

  test("question item opens question notebook editor", async ({ page }) => {
    await popover().within(async () => {
      await page.locator('text="Question"').click();
    });

    expect(page.url()).toContain("/question/notebook#");
  });

  test("question item opens SQL query editor", async ({ page }) => {
    await popover().within(async () => {
      await page.locator('text="SQL query"').click();
    });

    expect(page.url()).toContain("/question#");
    await page.locator(".ace_content");
  });

  test("collection opens modal and redirects to a created collection after saving", async ({ page }) => {
    await popover().within(async () => {
      await page.locator('text="Collection"').click();
    });

    await modal().within(async () => {
      await page.locator('text="Our analytics"');

      await page.locator('input[aria-label="Name"]').fill("Test collection");
      await page.locator('input[aria-label="Description"]').fill("Test collection description");

      await page.locator('text="Create"').click();
    });

    await expect(page.locator('[data-testid="collection-name-heading"]')).toHaveText("Test collection");
  });
});
