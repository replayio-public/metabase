import { restore, popover } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  query: {
    "source-table": ORDERS_ID,
    limit: 100,
  },
};


test.describe("issue 27123", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await createQuestion(page, questionDetails, { visitQuestion: true });
  });

  test("exclude filter should not resolve to 'Days of the week' regardless of the chosen granularity  (metabase#27123)", async ({ page }) => {
    await page.locator('[data-testid="header-cell"]').findByText("Created At").click();
    await page.locator(':text("Filter by this column")').click();
    await page.locator(':text("Exclude...")').click();
    await page.locator(':text("Months of the year...")').click();

    await popover(page)
      .locator(':text("Months of the year...")')
      .locator(':text("January")');
  });
});

