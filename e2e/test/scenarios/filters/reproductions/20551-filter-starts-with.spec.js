import { restore, openProductsTable, filter } from "e2e/support/helpers";


test.describe("issue 20551", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should allow filtering with includes, rather than starts with (metabase#20551)", async ({ page }) => {
    await openProductsTable({ mode: "notebook", page });
    await filter({ mode: "notebook", page });
    await page.locator('text=Category').click();

    // Make sure input field is auto-focused
    await expect(page.locator('input[placeholder="Search the list"]')).toBeFocused();
    await page.locator('input[placeholder="Search the list"]').type("i");

    // All categories that contain `i`
    await page.locator('text=Doohickey');
    await page.locator('text=Gizmo');
    await page.locator('text=Widget');

    await expect(page.locator('text=Gadget')).not.toBeVisible();
  });
});

