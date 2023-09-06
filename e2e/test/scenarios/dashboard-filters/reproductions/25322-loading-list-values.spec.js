import {
  addOrUpdateDashboardCard,
  popover,
  restore,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const parameterDetails = {
  name: "Location",
  slug: "location",
  id: "f8ec7c71",
  type: "string/=",
  sectionId: "location",
};

const questionDetails = {
  name: "Orders",
  query: { "source-table": ORDERS_ID },
};

const dashboardDetails = {
  name: "Dashboard",
  parameters: [parameterDetails],
};

test.describe("issue 25322", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("should show a loader when loading field values (metabase#25322)", async ({ page }) => {
    const { dashboard_id } = await createDashboard();
    visitDashboard(dashboard_id);
    throttleFieldValuesRequest(dashboard_id);

    await page.locator(`text=${parameterDetails.name}`).click();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});

const createDashboard = async () => {
  const { id: card_id } = await createQuestion(questionDetails);
  const { id: dashboard_id } = await createDashboard(dashboardDetails);

  await addOrUpdateDashboardCard({
    dashboard_id,
    card_id,
    card: {
      parameter_mappings: [
        {
          card_id,
          parameter_id: parameterDetails.id,
          target: ["dimension", ["field", ORDERS.STATE, null]],
        },
      ],
    },
  });

  return { dashboard_id };
};

const throttleFieldValuesRequest = dashboard_id => {
  const matcher = {
    method: "GET",
    url: `/api/dashboard/${dashboard_id}/params/${parameterDetails.id}/values`,
    middleware: true,
  };

  cy.intercept(matcher, req => req.on("response", res => res.setThrottle(10)));
};
