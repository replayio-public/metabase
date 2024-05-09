import { restore, visitDashboard } from "e2e/support/helpers";


test.describe("scenarios > dashboard > visualization options", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("column reordering should work (metabase#16229)", async ({ page }) => {
    await visitDashboard(page, 1);
    await page.locator('svg[name="pencil"]').click();
    await page.locator('.Card').hover();
    await page.locator('svg[name="palette"]').click();
    await page.locator('[data-testid="chartsettings-sidebar"]').within(async () => {
      const draggableItem = await page.locator('text("ID")').closest('[data-testid^="draggable-item"]');
      await draggableItem.drag({ x: 0, y: 100 });

      /**
       * When this issue gets fixed, it should be safe to uncomment the following assertion.
       * It currently doesn't work in UI at all, but Playwright somehow manages to move the "ID" column.
       * However, it leaves an empty column in its place (thus, making it impossible to use this assertion).
       */
      await expect(page.locator('[data-testid="draggable-item"]').first()).toHaveText("User ID");
    });

    // The table preview should get updated immediately, reflecting the changes in columns ordering.
    await expect(page.locator('.Modal').locator('[data-testid="column-header"]').first()).toHaveText("User ID");
  });
});

