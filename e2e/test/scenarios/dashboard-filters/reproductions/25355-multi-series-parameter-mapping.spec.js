import {
  editDashboard,
  popover,
  restore,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const question1Details = {
  name: "Q1",
  display: "line",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  visualization_settings: {
    "graph.metrics": ["count"],
    "graph.dimensions": ["CREATED_AT"],
  },
};

const question2Details = {
  name: "Q2",
  display: "line",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"], ["avg", ["field", ORDERS.TOTAL, null]]],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  visualization_settings: {
    "graph.metrics": ["avg"],
    "graph.dimensions": ["CREATED_AT"],
  },
};

const parameterDetails = {
  name: "Date Filter",
  slug: "date_filter",
  id: "888188ad",
  type: "date/all-options",
  sectionId: "date",
};

const dashboardDetails = {
  name: "25248",
  parameters: [parameterDetails],
};

test.describe("issue 25248", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should allow mapping parameters to combined cards individually (metabase#25248)", async ({ page }) => {
    await createDashboard();
    await editDashboard();

    await page.locator(`text=${parameterDetails.name}`).click();
    await page.locator('text=Select…').first().click();
    await popover().locator('text=Created At').first().click();

    await expect(page.locator('text=Order.Created At')).toBeVisible();
    await expect(page.locator('text=Select…')).toBeVisible();
  });
});

const createDashboard = async () => {
  const { id, card_id, dashboard_id } = await createQuestionAndDashboard({
    questionDetails: question1Details,
    dashboardDetails,
  });
  const { id: card_2_id } = await createQuestion(question2Details);
  await request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
    cards: [
      {
        id,
        card_id,
        series: [{ id: card_2_id }],
        row: 0,
        col: 0,
        size_x: 12,
        size_y: 8,
      },
    ],
  });
  visitDashboard(dashboard_id);
};
