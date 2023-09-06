import {
  addOrUpdateDashboardCard,
  restore,
  visitDashboard,
} from "e2e/support/helpers";

test.describe("issue 26230", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    prepareAndVisitDashboards();
  });

  test('should not preserve the sticky filter behavior when navigating to the second dashboard (metabase#26230)', async ({ page }) => {
    await page.locator('main').scrollTo('bottom');

    await page.locator('button:text("Toggle sidebar")').click();
    await expect(page.locator('main').locator('input[value="dashboard with a tall card 2"]')).not.toBeVisible();

    await expect(page.locator('[data-testid="dashboard-parameters-widget-container"]')).toHaveCSS('position', 'fixed');

    await page.locator('li:text("dashboard with a tall card")').click();

    await expect(page.locator('[data-testid="dashboard-parameters-widget-container"]')).not.toHaveCSS('position', 'fixed');
  });
});

async function prepareAndVisitDashboards() {
  const dashboard1 = await cy.createDashboard({
    name: "dashboard with a tall card",
    parameters: [
      {
        id: "12345678",
        name: "Text",
        slug: "text",
        type: "string/=",
        sectionId: "string",
      },
    ],
  });
  const dashboard1Id = dashboard1.body.id;
  createTextDashcard(dashboard1Id);
  bookmarkDashboard(dashboard1Id);

  const dashboard2 = await cy.createDashboard({
    name: "dashboard with a tall card 2",
    parameters: [
      {
        id: "87654321",
        name: "Text",
        slug: "text",
        type: "string/=",
        sectionId: "string",
      },
    ],
  });
  const dashboard2Id = dashboard2.body.id;
  createTextDashcard(dashboard2Id);
  bookmarkDashboard(dashboard2Id);
  visitDashboard(dashboard2Id);
}

async function bookmarkDashboard(dashboardId) {
  await cy.request("POST", `/api/bookmark/dashboard/${dashboardId}`);
}

function createTextDashcard(id) {
  addOrUpdateDashboardCard({
    dashboard_id: id,
    card_id: null,
    card: {
      size_x: 4,
      size_y: 20,
      visualization_settings: {
        virtual_card: {
          name: null,
          display: "text",
          visualization_settings: {},
          dataset_query: {},
          archived: false,
        },
        text: "I am a tall card",
      },
    },
  });
}
