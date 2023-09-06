import { restore, visitQuestion, popover, filter } from "e2e/support/helpers";

test.describe("filtering based on the remapped column name should result in a correct query (metabase#22715)", () => {
  test.beforeEach(async ({ page }) => {
    await restore(page);
    await cy.signInAsAdmin(page);

    const questionId = await cy.createNativeQuestion(page, {
      native: {
        query: `select 1 as "ID", current_timestamp::datetime as "ALIAS_CREATED_AT"`,
      },
    });

    // Visit the question to first load metadata
    visitQuestion(page, questionId);

    // Turn the question into a model
    await page.request("PUT", `/api/card/${questionId}`, { dataset: true });

    // Let's go straight to the model metadata editor
    await page.goto(`/model/${questionId}/metadata`);

    // The first column `ID` is automatically selected
    await mapColumnTo(page, { table: "Orders", column: "ID" });

    await page.click('text="ALIAS_CREATED_AT"');

    await mapColumnTo(page, { table: "Orders", column: "Created At" });

    // Make sure the column name updated before saving
    await page.fill('input[aria-label="Display name"]', "Created At");

    await page.click('button:text("Save changes")');

    await page.goto(`/model/${questionId}`);
  });

  test("when done through the column header action (metabase#22715-1)", async ({ page }) => {
    await page.click('text="Created At"');
    await page.click('text="Filter by this column"');
    await page.click('text="Today"');

    await expect(page.locator('text="Today"')).not.toBeVisible();

    await expect(page.locator(".cellData")).toHaveCount(4).and("contain", "Created At");
  });

  test("when done through the filter trigger (metabase#22715-2)", async ({ page }) => {
    await filter(page);

    await page.click('text="Today"');
    await page.click('text="Apply Filters"');

    await expect(page.locator(".cellData")).toHaveCount(4).and("contain", "Created At");
  });
});

async function mapColumnTo(page, { table, column } = {}) {
  await page.click('text="Database column this maps to"');
  await page.click('text="None"');

  await popover(page).click('text="${table}"');
  await popover(page).click('text="${column}"');
}
