import { restore } from "e2e/support/helpers";

const QUESTION = {
  native: { query: "select * from products" },
};


test.describe("issue 19180", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();
    page.route("/api/card/*/query").as("cardQuery");
  });

  test("shouldn't drop native model query results after leaving the query editor", async ({ page }) => {
    const QUESTION_ID = await createNativeQuestion(QUESTION);
    await page.request("PUT", `/api/card/${QUESTION_ID}`, { dataset: true });
    await page.goto(`/model/${QUESTION_ID}/query`);
    await page.waitForResponse("@cardQuery");
    await page.locator('button:has-text("Cancel")').click();
    await expect(page.locator(".TableInteractive")).toBeVisible();
    await expect(page.locator('text="Here\'s where your results will appear"')).not.toBeVisible();
  });
});

