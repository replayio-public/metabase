import { restore, popover, visualize, summarize } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "18069",
  query: {
    "source-table": PRODUCTS_ID,
    expressions: {
      ["CC_Category"]: ["field", PRODUCTS.CATEGORY, null],
      ["CC_LowerVendor"]: ["lower", ["field", PRODUCTS.VENDOR, null]],
      ["CC_UpperTitle"]: ["upper", ["field", PRODUCTS.TITLE, null]],
      ["CC_HalfPrice"]: ["/", ["field", PRODUCTS.PRICE, null], 2],
      ["CC_ScaledRating"]: ["*", 1.5, ["field", PRODUCTS.RATING, null]],
    },
  },
};


test.describe("issue 18069", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails).then(({ body: { id: QUESTION_ID } }) => {
      page.goto(`/question/${QUESTION_ID}/notebook`);
    });
  });

  test("should not allow choosing text fields for SUM (metabase#18069)", async ({ page }) => {
    summarize({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Sum of ..."');

    await page.locator('.Popover').within(async () => {
      // regular fields
      await page.locator('text="Price"');
      await page.locator('text="Rating"');

      // custom columns not suitable for SUM
      await expect(page.locator('text="CC_Category"')).not.toBeVisible();
      await expect(page.locator('text="CC_LowerVendor"')).not.toBeVisible();
      await expect(page.locator('text="CC_UpperTitle"')).not.toBeVisible();

      // custom columns suitable for SUM
      await page.locator('text="CC_HalfPrice"');
      await page.locator('text="CC_ScaledRating"').click();
    });

    visualize();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="1,041.45"');
  });
});

