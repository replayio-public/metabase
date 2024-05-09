import { restore, visualize, startNewQuestion } from "e2e/support/helpers";


test.describe("issue 4482", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    startNewQuestion();
    await page.locator('text=Sample Database').click();
    await page.locator('text=Products').click();
  });

  test("should be possible to summarize min of a temporal column (metabase#4482-1)", async ({ page }) => {
    pickMetric("Minimum of", page);

    await page.locator('text=Created At').click();

    visualize(page);

    await page.locator('text=April 1, 2016, 12:00 AM');
  });

  test("should be possible to summarize max of a temporal column (metabase#4482-2)", async ({ page }) => {
    pickMetric("Maximum of", page);

    await page.locator('text=Created At').click();

    visualize(page);

    await page.locator('text=April 1, 2019, 12:00 AM');
  });

  test("should be not possible to average a temporal column (metabase#4482-3)", async ({ page }) => {
    pickMetric("Average of", page);

    await expect(page.locator('text=Created At')).not.toBeVisible();
  });
});


async function pickMetric(metric, page) {
  await page.locator('text=Pick the metric').click();

  await page.locator(`text=${metric}`).click();
  await page.locator('text=Price');
  await page.locator('text=Rating');
}

