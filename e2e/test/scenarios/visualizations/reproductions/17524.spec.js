import {
  restore,
  filterWidget,
  filter,
  filterField,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const nativeQuestionDetails = {
  native: {
    query:
      "select * from (\nselect 'A' step, 41 users, 42 median union all\nselect 'B' step, 31 users, 32 median union all\nselect 'C' step, 21 users, 22 median union all\nselect 'D' step, 11 users, 12 median\n) x\n[[where users>{{num}}]]\n",
    "template-tags": {
      num: {
        id: "d7f1fb15-c7b8-6051-443d-604b6ed5457b",
        name: "num",
        "display-name": "Num",
        type: "number",
        default: null,
      },
    },
  },
  display: "funnel",
  visualization_settings: {
    "funnel.dimension": "STEP",
    "funnel.metric": "USERS",
  },
};

const questionDetails = {
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"], ["sum", ["field", PRODUCTS.PRICE, null]]],
    breakout: [["field", PRODUCTS.CATEGORY, null]],
  },
  display: "funnel",
  visualization_settings: {
    "funnel.metric": "count",
    "funnel.dimension": "CATEGORY",
  },
};


test.describe("issue 17524", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test.describe("scenario 1", () => {
    test.beforeEach(async ({ page }) => {
      await createNativeQuestion(page, nativeQuestionDetails, { visitQuestion: true });
    });

    test("should not alter visualization type when applying filter on a native question (metabase#17524-1)", async ({ page }) => {
      await filterWidget(page).type("1");

      await page.locator("polygon");

      await page.locator("svg path[aria-label='icon-play']").last().click();

      await page.locator("polygon");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Save")).not.toBeVisible();
    });
  });

  test.describe("scenario 2", () => {
    test.beforeEach(async ({ page }) => {
      await createQuestion(page, questionDetails, { visitQuestion: true });
    });

    test("should not alter visualization type when applying filter on a QB question (metabase#17524-2)", async ({ page }) => {
      await page.locator("polygon");

      await filter(page);

      await filterField(page, "ID", {
        operator: "Greater than",
        value: "1",
      });
      await page.locator('[data-testid="apply-filters"]').click();

      await page.locator("polygon");
    });
  });
});

