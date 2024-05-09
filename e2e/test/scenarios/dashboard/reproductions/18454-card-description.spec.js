import { restore, visitDashboard } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const CARD_DESCRIPTION = "CARD_DESCRIPTION";

const questionDetails = {
  name: "18454 Question",
  description: CARD_DESCRIPTION,
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
    breakout: [["field", PRODUCTS.CATEGORY, null]],
  },
  display: "line",
};


test.describe("issue 18454", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    await createQuestionAndDashboard({ questionDetails }).then(
      ({ body: { id, card_id, dashboard_id } }) => {
        visitDashboard(dashboard_id);
      },
    );
  });

  test("should show card descriptions (metabase#18454)", async ({ page }) => {
    await page.locator(".DashCard").hover();
    await page.locator(".DashCard").within(() => {
      page.locator('svg[name="info"]').hover({ force: true });
    });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${CARD_DESCRIPTION}`);
  });
});

