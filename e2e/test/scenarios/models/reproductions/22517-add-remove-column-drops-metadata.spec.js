import { restore, openQuestionActions } from "e2e/support/helpers";

test.describe("issue 22517", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/card/*/query");
    await page.route("PUT", "/api/card/*");

    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(
      {
        name: "22517",
        native: { query: `select * from orders` },
        dataset: true,
      },
      { visitQuestion: true },
    );

    openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Edit metadata').click();

    renameColumn("ID", "Foo");

    await page.locator('text=Save changes').click();
    await page.waitForResponse("/api/card/*");
  });

  test("adding or removging a column should not drop previously edited metadata (metabase#22517)", async ({ page }) => {
    openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Edit query definition').click();

    // Make sure previous metadata changes are reflected in the UI
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Foo');

    // This will edit the original query and add the `SIZE` column
    // Updated query: `select *, case when quantity > 4 then 'large' else 'small' end size from orders`
    await page.locator('.ace_content').type(
      "{leftarrow}".repeat(" from orders".length) +
        ", case when quantity > 4 then 'large' else 'small' end size ",
    );

    await page.locator('.NativeQueryEditor .Icon-play').click();
    await page.waitForResponse("@dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Foo');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Save changes').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Foo');
  });
});

async function renameColumn(column, newName, page) {
  await page.locator(`[value="${column}"]`).clear().type(newName).blur();
}
