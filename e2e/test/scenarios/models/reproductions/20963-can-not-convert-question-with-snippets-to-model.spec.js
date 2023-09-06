import {
  restore,
  modal,
  openNativeEditor,
  popover,
  openQuestionActions,
} from "e2e/support/helpers";

const snippetName = `string 'test'`;
const questionName = "Converting questions with snippets to models";


test.describe("issue 20963", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should allow converting questions with static snippets to models (metabase#20963)", async ({ page }) => {
    await page.goto("/");

    openNativeEditor();

    // Create a snippet
    await page.locator('icon("snippet")').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Create a snippet")').click();

    modal().within(async () => {
      await page.locator('input[aria-label="Enter some SQL here so you can reuse it later"]').fill(
        `'test'`,
      );
      await page.locator('input[aria-label="Give your snippet a name"]').fill(snippetName);
      await page.locator('text("Save")').click();
    });

    await page.locator('@editor').type(`{moveToStart}select `);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Save")').click();
    modal().within(async () => {
      // I don't know why the input lost focus, especially when we ran the query before saving.
      // that'll be worse as the characters we type will go to the query input instead of the
      // name input.
      await page.locator('input[aria-label="Name"]').fill(questionName);
      await page.locator('text("Save")').click();
    });

    // dismiss modal
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Not now")').click();

    // Convert into to a model
    openQuestionActions();
    popover().within(async () => {
      await page.locator('icon("model")').click();
    });

    modal().within(async () => {
      await page.locator('text("Turn this into a model")').click();
    });
  });
});

