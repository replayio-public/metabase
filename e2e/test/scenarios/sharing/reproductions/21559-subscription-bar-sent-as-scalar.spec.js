import {
  restore,
  visitDashboard,
  editDashboard,
  saveDashboard,
  setupSMTP,
  sendEmailAndAssert,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { admin } = USERS;

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const q1Details = {
  name: "21559-1",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["avg", ["field", ORDERS.TOTAL, null]]],
  },
  display: "scalar",
};

const q2Details = {
  name: "21559-2",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["avg", ["field", PRODUCTS.PRICE, null]]],
  },
  display: "scalar",
};


test.describe("issue 21559", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    setupSMTP();

    await createQuestionAndDashboard({
      questionDetails: q1Details,
    }).then(async ({ body: { dashboard_id } }) => {
      await createQuestion(q2Details);

      visitDashboard(dashboard_id);
      editDashboard();
    });
  });

  test("should respect dashboard card visualization (metabase#21559)", async ({ page }) => {
    await page.locator('[data-testid="add-series-button"]').click({ force: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${q2Details.name}`).click();
    await page.locator('.AddSeriesModal').within(async () => {
      await page.locator('text=Done').click();
    });

    // Make sure visualization changed to bars
    await expect(page.locator('.bar')).toHaveCount(2);

    saveDashboard();

    await page.locator('icon=subscription').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Email it').click();

    await page.locator('[placeholder="Enter user names or email addresses"]')
      .click()
      .type(`${admin.first_name} ${admin.last_name}{enter}`)
      .blur(); // blur is needed to close the popover

    sendEmailAndAssert(email => {
      expect(email.html).to.include("img"); // Bar chart is sent as img (inline attachment)
      expect(email.html).not.to.include("80.52"); // Scalar displays its value in HTML
    });
  });
});

