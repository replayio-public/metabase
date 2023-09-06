import _ from "underscore";
import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const PAGE_SIZE = 50;
const TOTAL_ITEMS = PAGE_SIZE + 1;


test.describe("scenarios > search", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();
  });

  test("should not search on an empty string", async ({ page }) => {
    page.route("/api/search", req => {
      expect("Unexpected call to /api/search").toBe(false);
    });
    await page.goto("/");
    await page.locator('input[placeholder="Search…"]').fill(" ");
  });

  test("should allow users to paginate results", async ({ page }) => {
    generateQuestions(TOTAL_ITEMS);

    await page.goto("/");
    await page.locator('input[placeholder="Search…"]').fill("generated question{enter}");
    await expect(page.locator('[aria-label="Previous page"]')).toBeDisabled();

    // First page
    await expect(page.locator(':text("1 - ${PAGE_SIZE}")')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-total"]')).toHaveText(TOTAL_ITEMS);
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount(PAGE_SIZE);

    await page.locator('[aria-label="Next page"]').click();

    // Second page
    await expect(page.locator(':text("${PAGE_SIZE + 1} - ${TOTAL_ITEMS}")')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-total"]')).toHaveText(TOTAL_ITEMS);
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount(1);
    await expect(page.locator('[aria-label="Next page"]')).toBeDisabled();

    await page.locator('[aria-label="Previous page"]').click();

    // First page
    await expect(page.locator(':text("1 - ${PAGE_SIZE}")')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-total"]')).toHaveText(TOTAL_ITEMS);
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount(PAGE_SIZE);
  });
});


const generateQuestions = count => {
  _.range(count).map(i =>
    cy.createQuestion({
      name: `generated question ${i}`,
      query: {
        "source-table": ORDERS_ID,
        aggregation: [["count"]],
        breakout: [
          ["field", ORDERS.CREATED_AT, { "temporal-unit": "hour-of-day" }],
        ],
      },
    }),
  );
};
