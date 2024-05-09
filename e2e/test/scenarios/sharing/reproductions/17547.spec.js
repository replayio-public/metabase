import { restore, popover, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PEOPLE } = SAMPLE_DATABASE;

const questionDetails = {
  query: {
    "source-table": ORDERS_ID,
    breakout: [
      ["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }],
      ["field", PEOPLE.SOURCE, { "source-field": ORDERS.USER_ID }],
    ],
    aggregation: [["count"]],
  },
  display: "area",
};

test.describe("issue 17547", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails).then(({ body: { id: questionId } }) => {
      setUpAlert(questionId);

      visitQuestion(questionId);
    });
  });

  test('editing an alert should not delete it (metabase#17547)', async ({ page }) => {
    await page.locator('svg[name="bell"]').click();
    await popover().within(() => {
      page.locator('text="Daily, 12:00 PM"');
      page.locator('text="Edit"').click();
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="AM"').click();
    await page.locator('text="Save changes"').click();

    await page.waitForResponse("@alertQuery");

    await page.locator('svg[name="bell"]').click();
    await popover().within(() => {
      page.locator('text="Daily, 12:00 AM"');
    });
  });
});

async function setUpAlert(questionId) {
  await cy.request("POST", "/api/alert", {
    channels: [
      {
        schedule_type: "daily",
        schedule_hour: 12,
        channel_type: "slack",
        schedule_frame: null,
        recipients: [],
        details: { channel: "#work" },
        pulse_id: 1,
        id: 1,
        schedule_day: null,
        enabled: true,
      },
    ],
    alert_condition: "rows",
    name: null,
    creator_id: 1,
    card: { id: questionId, include_csv: true, include_xls: false },
    alert_first_only: false,
    skip_if_empty: true,
    parameters: [],
    dashboard_id: null,
  }).then(({ body: { id: alertId } }) => {
    cy.intercept("PUT", `/api/alert/${alertId}`).as("alertQuery");
  });
}
