import { restore } from "e2e/support/helpers";
import { openDetailsSidebar } from "../helpers/e2e-models-helpers";

const renamedColumn = "TITLE renamed";

const questionDetails = {
  name: "20624",
  dataset: true,
  native: { query: "select * from PRODUCTS limit 2" },
  visualization_settings: {
    column_settings: { '["name","TITLE"]': { column_title: renamedColumn } },
  },
};

describe.skip("issue 20624", (() => {
  test.beforeEach(async ({ page }) => {
    await interceptPUT(page, "/api/card/*", "updateCard");

    restore();
    await signInAsAdmin(page);

    await createNativeQuestion(page, questionDetails, { visitQuestion: true });
  });

  test('models metadata should override previously defined column settings (metabase#20624)', async ({ page }) => {
    openDetailsSidebar();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Customize metadata').click();

    // Open settings for this column
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${renamedColumn}`).click();
    // Let's set a new name for it
    await page.locator(`input[value="${renamedColumn}"]`).fill('Foo');
    await page.locator(`input[value="${renamedColumn}"]`).blur();

    await page.locator('button:text("Save changes")').click();
    await page.waitForResponse("@updateCard");

    await expect(page.locator('.cellData')).toContainText("Foo");
  });
}));
