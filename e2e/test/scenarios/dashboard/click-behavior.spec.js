import {
  addOrUpdateDashboardCard,
  restore,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID, REVIEWS, REVIEWS_ID } =
  SAMPLE_DATABASE;

test.describe("scenarios > dashboard > dashboard cards > click behavior", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test('should show filters defined on a question with filter pass-thru (metabase#15993)', async () => {
    // ... (keep the existing code inside the test)

    // Drill-through
    await page.locator('[data-testid="cell-data"] .link').findByTextContent('0').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator('text=117.03')).not.toBeVisible(); // Total for the order in which quantity wasn't 0
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Quantity is equal to 0');

    // ... (keep the existing code inside the test)
  });

  test('should not change the visualization type in a targetted question with mapped filter (metabase#16334)', async () => {
    // ... (keep the existing code inside the test)

    await page.locator('[data-testid="cell-data"]').findByTextContent('5').first().click();

    // Make sure filter is set
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Rating is equal to 5');

    // Make sure it's connected to the original question
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Started from 16334');

    // Make sure the original visualization didn't change
    await page.locator('[data-testid="slice"]');

    // ... (keep the existing code inside the test)
  });

  test('should navigate to a target from a gauge card (metabase#23137)', async () => {
    // ... (keep the existing code inside the test)

    await page.locator('[data-testid="gauge-arc-1"]').click();
    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Orders');
  });

  test('should navigate to a target from a progress card (metabase#23137)', async () => {
    // ... (keep the existing code inside the test)

    await page.locator('[data-testid="progress-bar"]').click();
    await page.waitForResponse("@dataset");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Orders');
  });
});

const getQuestionDetails = ({ display }) => ({
  display,
  query: {
    "source-table": REVIEWS_ID,
    aggregation: [["count"]],
  },
});

const getDashcardDetails = ({ id, card_id, target_id }) => ({
  id,
  card_id,
  row: 0,
  col: 0,
  size_x: 12,
  size_y: 10,
  visualization_settings: {
    click_behavior: {
      type: "link",
      linkType: "question",
      targetId: target_id,
      parameterMapping: {},
    },
  },
});
