import { restore } from "e2e/support/helpers";


test.describe("issue 19603", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();

    // Archive second collection (nested under the first one)
    const response = await page.context().request("GET", "/api/collection/");
    const { id } = response.body.find(c => c.slug === "second_collection");

    archiveCollection(id);
  });

  test("archived subcollection should not show up in permissions (metabase#19603)", async ({ page }) => {
    await page.goto("/admin/permissions/collections");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="First collection"').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="Second collection"')).not.toBeVisible();
  });
});
