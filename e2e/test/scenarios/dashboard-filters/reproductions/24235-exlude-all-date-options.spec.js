import { popover, restore, visitDashboard } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  query: { "source-table": PRODUCTS_ID },
};

const parameter = {
  id: "727b06c1",
  name: "Date Filter",
  sectionId: "date",
  slug: "date_filter",
  type: "date/all-options",
};

const parameterTarget = [
  "dimension",
  ["field", PRODUCTS.CREATED_AT, { "temporal-unit": "month" }],
];

const dashboardDetails = { parameters: [parameter] };

test.describe("issue 24235", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/dashboard/**/query").as("getCardQuery");
  });

  test('should remove filter when all exclude options are selected (metabase#24235)', async ({ page }) => {
    cy.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
      ({ body: { id, card_id, dashboard_id } }) => {
        mapParameterToDashboardCard({ id, card_id, dashboard_id });
        visitDashboard(dashboard_id);
      },
    );

    await page.locator(`text=${parameter.name}`).click();

    popover().within(() => {
      cy.findByText("Exclude...").click();
      cy.findByText("Days of the week...").click();
      cy.findByText("Select none...").click();
      cy.findByText("Select all...").click();
      cy.findByText("Update filter").click();
    });

    await page.waitForResponse("@getCardQuery");
    await page.locator("text=Rows 1-13 of 200").isVisible();
  });
});

const mapParameterToDashboardCard = ({ id, card_id, dashboard_id }) => {
  cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
    cards: [
      {
        id,
        card_id,
        row: 0,
        col: 0,
        size_x: 18,
        size_y: 10,
        parameter_mappings: [
          {
            card_id,
            parameter_id: parameter.id,
            target: parameterTarget,
          },
        ],
      },
    ],
  });
};
