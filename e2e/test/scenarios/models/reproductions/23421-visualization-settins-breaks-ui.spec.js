import { restore, openQuestionActions } from "e2e/support/helpers";

const query = 'SELECT 1 AS "id", current_timestamp::timestamp AS "created_at"';

const questionDetails = {
  native: {
    query,
  },
  displayIsLocked: true,
  visualization_settings: {
    "table.columns": [],
    "table.pivot_column": "orphaned1",
    "table.cell_column": "orphaned2",
  },
  dataset: true,
};


test.describe("issue 23421", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    await createNativeQuestion(questionDetails, { visitQuestion: true });
  });

  test("`visualization_settings` should not break UI (metabase#23421)", async ({ page }) => {
    openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Edit query definition")').click();

    await expect(page.locator('.ace_content')).toContainText(query);
    await expect(page.locator('.cellData')).toHaveCount(4);

    await expect(page.locator('button:text("Save changes")')).toBeDisabled();
  });
});
