import {
  restore,
  popover,
  visitDashboard,
  saveDashboard,
  editDashboard,
  setFilter,
} from "e2e/support/helpers";

const questionDetails = {
  name: "22524 question",
  native: {
    query: "select * from people where city = {{city}}",
    "template-tags": {
      city: {
        id: "6d077d39-a420-fd14-0b0b-a5eb611ce1e0",
        name: "city",
        "display-name": "City",
        type: "text",
      },
    },
  },
};


test.describe("issue 22524", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
  });

  test("update dashboard cards when changing parameters on publicly shared dashboards (metabase#22524)", async ({ page }) => {
    cy.createNativeQuestionAndDashboard({ questionDetails }).then(
      ({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      },
    );

    editDashboard();
    setFilter("Text or Category", "Is");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=Select…').click();
    popover().contains("City").click();

    saveDashboard();

    // Share dashboard
    cy.icon("share").click();
    cy.findByRole("switch").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Public link")
      .parent()
      .within(() => {
        cy.get("input").then(input => {
          cy.visit(input.val());
        });
      });

    // Set parameter value
    await page.locator('input[placeholder="Text"]').fill('Rye');
    await page.locator('input[placeholder="Text"]').press('Enter');

    // Check results
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=2-7900 Cuerno Verde Road');
  });
});
