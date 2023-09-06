import { restore, questionInfoButton, visitModel } from "e2e/support/helpers";

test.describe("scenarios > models > revision history", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test.beforeEach(async () => {
    await request("PUT", "/api/card/3", {
      name: "Orders Model",
      dataset: true,
    });
  });

  test('should allow reverting to a saved question state and back into a model again', async ({ page }) => {
    visitModel(3);

    openRevisionHistory();
    revertTo("You created this");
    await page.waitForResponse("@modelQuery3");

    expect(page.url()).toMatch(/^\/question\/3/);
    await page.locator(".LineAreaBarChart");

    revertTo("You edited this");
    await page.waitForResponse("@modelQuery3");

    expect(page.url()).toMatch(/^\/model\/3/);
    await page.locator(".cellData");
  });
});

async function openRevisionHistory() {
  page.route("GET", "/api/user").as("user");
  questionInfoButton().click();
  await page.waitForResponse("@user");

  await page.locator("text=History");
}

async function revertTo(history) {
  const r = new RegExp(history);
  await page.locator(`text=${r}`).closest("li").locator("[data-testid=question-revert-button]").click();
}
