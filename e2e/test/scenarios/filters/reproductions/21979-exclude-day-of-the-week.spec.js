import { restore, openProductsTable, popover } from "e2e/support/helpers";


test.describe("issue 21979", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await openProductsTable({ mode: "notebook", page });
    await page.route("POST", "/api/dataset");
  });

  test("exclude 'day of the week' should show the correct day reference in the UI (metabase#21979)", async ({ page }) => {
    await page.locator('text=Filter').click();
    await page.locator('text=Created At').click();

    await page.locator('text=Exclude...').click();
    await page.locator('text=Days of the week...').click();

    await popover(page).locator('text=Monday').click();
    await popover(page).locator('button:text=Add filter').click();

    await page.locator('text=Created At excludes Monday').isVisible();

    await page.locator('button:text=Visualize').click();
    await page.waitForResponse("POST", "/api/dataset");

    await expect(page.locator('text=Enormous Marble Wallet')).not.toBeVisible();

    await page.locator('text=Created At excludes Monday').click();

    await popover(page).locator('text=Monday').click();
    await popover(page).locator('text=Thursday').click();

    await popover(page).locator('button:text=Update filter').click();
    await page.waitForResponse("POST", "/api/dataset");

    await page.locator('text=Created At excludes Thursday').isVisible();
    await page.locator('text=Enormous Marble Wallet').isVisible();
  });
});

