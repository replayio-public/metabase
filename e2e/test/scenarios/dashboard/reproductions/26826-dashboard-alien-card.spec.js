import {
  restore,
  visitDashboard,
  openProductsTable,
  saveDashboard,
} from "e2e/support/helpers";


test.describe("issue 26826", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitDashboard(1);
  });

  test("adding question to one dashboard shouldn't affect unrelated dashboards (metabase#26826)", async ({ page }) => {
    openProductsTable();
    saveQuestion();
    addQuestionToDashboardFromSaveModal();

    openRecentItemFromSearch("Orders in a dashboard");
    await expect(page.locator(".Card")).toHaveCount(1);
    await expect(page.locator("text=You're editing this dashboard.")).not.toBeVisible();
  });
});



async function saveQuestion() {
  const saveQuestionRequest = await page.waitForEvent('requestfinished', { url: '/api/card' });

  await page.locator('text=Save').click();

  await page.locator('.Modal').locator('button').withText('Save').click();
  await saveQuestionRequest;
}



async function addQuestionToDashboardFromSaveModal(dashboardName = "foo") {
  await page.locator('text=Yes please!').click();
  await page.locator('text=Create a new dashboard').click();

  await page.locator('input[aria-label="Name"]').fill(dashboardName).blur();
  await page.locator('button').withText('Create').click();

  saveDashboard();
}



async function openRecentItemFromSearch(item) {
  await page.locator('input[placeholder="Search"]').click();
  await page.locator('testId=recently-viewed-item-title').locator(`text=${item}`).click();
}

