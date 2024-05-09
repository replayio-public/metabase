import { restore, enterCustomColumnDetails } from "e2e/support/helpers";

const ccName = "CTax";

describe.skip("issue 28193", (() => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset").as("dataset");

    restore();
    await page.signInAsAdmin();

    // Turn the question into a model
    await page.request("PUT", "/api/card/1", { dataset: true });
  });

  test('should be able to use custom column in a model query (metabase#28193)', async ({ page }) => {
    // Go directly to model's query definition
    await page.goto("/model/1/query");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Custom column"').click();
    enterCustomColumnDetails({
      formula: "[Tax]",
      name: ccName,
    });
    await page.locator('button:text("Done")').click();

    await page.locator('.RunButton').click();
    await page.waitForResponse("@dataset");

    await page.locator('button:text("Save changes")').click();
    await expect(page.locator('pathname')).not.toInclude('/query');

    assertOnColumns();

    await page.reload();
    await page.waitForResponse("@dataset");

    assertOnColumns();
  });
}));

async function assertOnColumns() {
  await expect(page.locator('text="2.07"')).toBeVisible().toHaveCount(2);
  await expect(page.locator('[data-testid="header-cell"]')).toBeVisible().last().toHaveText(ccName);
}
