import { restore, filterWidget, visitDashboard } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "Orders join Products",
  query: {
    "source-table": ORDERS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field-id", ORDERS.PRODUCT_ID],
          ["joined-field", "Products", ["field-id", PRODUCTS.ID]],
        ],
        alias: "Products",
      },
    ],
    limit: 5,
  },
};

const filter = {
  name: "Text",
  slug: "text",
  id: "7653fdfa",
  type: "string/=",
  sectionId: "string",
};

const dashboardDetails = {
  parameters: [filter],
};


test.describe("scenarios > dashboard > filters", () => {
  test.beforeEach(async ({ page }) => {
    // Replace "cy.intercept" with Playwright's "page.route"
    await page.route("GET", `/api/dashboard/*/params/${filter.id}/values`);

    restore();
    cy.signInAsAdmin();

    cy.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
      ({ body: dashboardCard }) => {
        const { card_id, dashboard_id } = dashboardCard;

        const updatedCardDetails = {
          size_x: 16,
          size_y: 10,
          parameter_mappings: [
            {
              parameter_id: filter.id,
              card_id,
              target: [
                "dimension",
                [
                  "field",
                  PRODUCTS.TITLE,
                  {
                    "join-alias": "Products",
                  },
                ],
              ],
            },
          ],
        };

        cy.editDashboardCard(dashboardCard, updatedCardDetails);

        visitDashboard(dashboard_id);
      },
    );
  });

  test("should work properly when connected to the explicitly joined field", async ({ page }) => {
    await filterWidget().click();
    // Replace "cy.wait" with Playwright's "page.waitForResponse"
    await page.waitForResponse(`GET`, `/api/dashboard/*/params/${filter.id}/values`);

    await page.locator('input[placeholder="Search the list"]').fill("Awe");

    selectFromDropdown(["Awesome Concrete Shoes", "Awesome Iron Hat"]);

    await page.locator('button:text("Add filter")').click();

    // Replace "cy.location" with Playwright's "page.url"
    expect(page.url()).toContain("?text=Awesome%20Concrete%20Shoes&text=Awesome%20Iron%20Hat");

    filterWidget().contains("2 selections");

    await page.locator(".Card").within(() => {
      page.locator('text("Awesome Concrete Shoes")');
      page.locator('text("Awesome Iron Hat")');
    });
  });
});



async function selectFromDropdown(values) {
  for (const value of values) {
    await page.locator(`[data-testid="${value}-filter-value"]`).shouldBeVisible().click();
  }
}

