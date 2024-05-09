import { restore, visitQuestion } from "e2e/support/helpers";

const questionDetails = {
  name: "20044",
  native: {
    query: "select 1",
  },
};


test.describe("issue 20044", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("nodata user should not see 'Explore results' (metabase#20044)", async ({ page }) => {
    const questionId = await createNativeQuestion(page, questionDetails);
    await signIn(page, "nodata");

    visitQuestion(page, questionId);

    await expect(page.locator(".cellData")).toHaveText("1");
    await expect(page.locator('text="Explore results"')).toBeHidden();
  });
});

