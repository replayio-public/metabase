import { restore, visitQuestion } from "e2e/support/helpers";

const question = {
  name: "17019",
  native: {
    query: "select {{foo}}",
    "template-tags": {
      foo: {
        id: "08edf340-3d89-cfb1-b7f0-073b9eca6a32",
        name: "foo",
        "display-name": "Filter",
        type: "text",
      },
    },
  },
  display: "scalar",
};


test.describe("issue 17019", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    const questionId = await createNativeQuestion(page, question);
    // Enable sharing
    await page.request("POST", `/api/card/${questionId}/public_link`);

    visitQuestion(page, questionId);
  });

  test("question filters should work for embedding/public sharing scenario (metabase#17019)", async ({ page }) => {
    await page.locator('.Icon[name="share"]').click();

    const publicURL = await page.locator('input[displayvalue^="http"]').getAttribute("value");
    await page.goto(publicURL);

    await page.locator('input[placeholder="Filter"]').fill("456");
    await page.locator('input[placeholder="Filter"]').press('Enter');

    // We should see the result as a scalar
    await expect(page.locator(".ScalarValue")).toHaveText("456");
    // But let's also check that the filter widget has that same value still displayed
    await expect(page.locator('input[displayvalue="456"]')).toBeVisible();
  });
});

