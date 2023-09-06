import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  query: {
    "source-query": {
      "source-table": PRODUCTS_ID,
      filter: [
        "and",
        ["=", ["field", PRODUCTS.CATEGORY, null], "Gadget", "Gizmo"],
        [
          "time-interval",
          ["field", PRODUCTS.CREATED_AT, null],
          -30,
          "year",
          {
            include_current: false,
          },
        ],
      ],
      aggregation: [["count"]],
      breakout: [["field", PRODUCTS.CATEGORY, null]],
    },
    filter: [
      ">",
      [
        "field",
        "count",
        {
          "base-type": "type/Integer",
        },
      ],
      0,
    ],
  },
};

test.describe("issue 24994", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();
  });

  test("should allow updating filters (metabase#24994)", async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });

    // Three filters
    await page.locator('[data-testid="filters-visibility-control"]').locator("text=3").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Category is 2 selections').click();
    await assertFilterValueIsSelected("Gadget");
    await assertFilterValueIsSelected("Gizmo");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Doohickey').click();
    await assertFilterValueIsSelected("Doohickey");
    await page.locator('text=Update filter').isEnabled().click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Category is 3 selections');
  });
});

async function assertFilterValueIsSelected(value, { page }) {
  await page.locator(`[data-testid="${value}-filter-value"]`).locator("input").isChecked();
}
