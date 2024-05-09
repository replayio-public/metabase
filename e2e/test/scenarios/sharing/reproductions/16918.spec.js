import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "16918",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
    breakout: [
      ["field", PRODUCTS.CREATED_AT, { "temporal-unit": "month-of-year" }],
      ["field", PRODUCTS.CATEGORY, null],
    ],
  },
  display: "line",
};


test.describe("issue 16918", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();

    await createQuestion(questionDetails).then(({ body }) => {
      test.intercept("GET", `/api/pulse/preview_card_info/${body.id}`).as(
        "cardPreview",
      );
    });
  });

  test(`should load question binned by "Month of year" or similar granularity (metabase#16918)`, async ({ page }) => {
    await page.goto("/pulse/create");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Select a question"');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="16918"');

    await page.waitForResponse("@cardPreview").then(xhr => {
      expect(xhr.response.statusCode).not.to.eq(500);
    });

    // Playwright should be able to find question title in the card preview
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="16918"');
  });
});

