import { restore, popover } from "e2e/support/helpers";

const modelName = "Orders Model";


test.describe("issue 19776", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await page.goto('/auth/login');
    await signInAsAdmin(page);

    await page.request("PUT", "/api/card/1", { name: modelName, dataset: true });
  });

  test("should show moved model in the data picker without refreshing (metabase#19776)", async ({ page }) => {
    await page.goto("/collection/root");

    await openEllipsisMenuFor(page, modelName);
    await popover(page).locator().contains("Archive").click();

    await page.locator('text=Archived model');

    await page.locator('text=New').click();
    await page.locator('text=Question').shouldBeVisible().click();

    await page.locator('text=Sample Database');
    await page.locator('text=Saved Questions');
    await page.locator('text=Models').shouldNotExist();
  });
});



async function openEllipsisMenuFor(page, item) {
  await page.locator(`text=${item}`).closest("tr").locator(".Icon-ellipsis").click();
}

