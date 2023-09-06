import {
  restore,
  popover,
  visualize,
  startNewQuestion,
} from "e2e/support/helpers";

test.describe("issue 17963", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore("mongo-4");
    cy.signInAsAdmin();

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=QA Mongo4").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Orders").click();
  });

  test('should be able to compare two fields using filter expression (metabase#17963)', async ({ page }) => {
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Add filters to narrow your answer").click();

    popover().contains("Custom Expression").click();

    await typeAndSelect([
      { string: "dis", field: "Discount" },
      { string: "> qu", field: "Quantity" },
    ]);
    await page.locator(".ace_text-input").blur();

    await page.locator("text=Done").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Discount > Quantity");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Pick the metric you want to see").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Count of rows").click();

    visualize();

    await page.locator(".ScalarValue").contains("1,337");
  });
});

async function typeAndSelect(arr, page) {
  for (const { string, field } of arr) {
    await page.locator(".ace_text-input").type(string);

    popover().contains(field).click();
  }
}
