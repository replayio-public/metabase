import {
  getNotebookStep,
  openQuestionActions,
  restore,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "29951",
  query: {
    "source-table": ORDERS_ID,
    expressions: {
      CC1: ["+", ["field", ORDERS.TOTAL], 1],
      CC2: ["+", ["field", ORDERS.TOTAL], 1],
    },
  },
  dataset: true,
};


test.describe("issue 29951", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.route("POST", "/api/dataset");
    await page.route("PUT", "/api/card/*");
  });

  test("should allow to run the model query after changing custom columns (metabase#29951)", async ({ page }) => {
    await createQuestion(page, questionDetails, { visitQuestion: true });

    openQuestionActions();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Edit query definition"');
    removeExpression("CC2");
    await page.click('button[role="button"]:has-text("Save changes")');

    dragColumn(0, 100);
    await page.click('button[role="button"]:has-text("Get Answer"):nth-child(1)');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text="Showing first 2,000 rows"')).toBeVisible();
  });
});

const removeExpression = name => {
  getNotebookStep("expression")
    .findByText(name)
    .findByLabelText("close icon")
    .click();
};

const dragColumn = (page, index, distance) => {
  await page.locator(".react-draggable")
    .nth(index)
    .dispatchEvent("mousedown", 0, 0, { force: true })
    .dispatchEvent("mousemove", distance, 0, { force: true })
    .dispatchEvent("mouseup", distance, 0, { force: true });
};
