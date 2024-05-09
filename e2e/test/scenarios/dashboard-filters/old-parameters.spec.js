import { restore, popover, visitDashboard } from "e2e/support/helpers";
// NOTE: some overlap with parameters-embedded.cy.spec.js
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PEOPLE_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

// the dashboard parameters used in these tests ('category' and 'location/...') are no longer accessible
// via the UI but should still work as expected


test.describe("scenarios > dashboard > OLD parameters", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test.describe("question connected to a 'category' parameter", () => {
    test.beforeEach(async () => {
      const filter = {
        id: "c2967a17",
        name: "Category",
        slug: "category",
        type: "category",
      };

      const questionDetails = {
        name: "Products table",
        query: {
          "source-table": PRODUCTS_ID,
        },
      };

      const dashboardDetails = {
        parameters: [filter],
      };

      cy.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
        ({ body: { id, card_id, dashboard_id } }) => {
          cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
            cards: [
              {
                id,
                card_id,
                row: 0,
                col: 0,
                size_x: 8,
                size_y: 6,
                parameter_mappings: [
                  {
                    card_id,
                    parameter_id: filter.id,
                    target: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
                  },
                ],
              },
            ],
          });

          visitDashboard(dashboard_id);
        },
      );
    });

    test("should work", async ({ page }) => {
      await page.locator('text=Doohickey');

      await page.locator('text=Category').click();
      await popover().locator('text=Gadget').click();
      await popover().locator('text=Add filter').click();

      // verify that the filter is applied
      await expect(page.locator('text=Doohickey')).not.toBeVisible();
    });
  });

  test.describe("question connected to a 'location/state' parameter", () => {
    test.beforeEach(async () => {
      const filter = {
        id: "c2967a17",
        name: "City",
        slug: "city",
        type: "location/city",
      };

      const questionDetails = {
        name: "People table",
        query: {
          "source-table": PEOPLE_ID,
        },
      };

      const dashboardDetails = { parameters: [filter] };

      cy.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
        ({ body: { id, card_id, dashboard_id } }) => {
          cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
            cards: [
              {
                id,
                card_id,
                row: 0,
                col: 0,
                size_x: 8,
                size_y: 6,
                parameter_mappings: [
                  {
                    card_id,
                    parameter_id: filter.id,
                    target: ["dimension", ["field", PEOPLE.CITY, null]],
                  },
                ],
              },
            ],
          });

          visitDashboard(dashboard_id);
        },
      );
    });

    test("should work", async ({ page }) => {
      await page.locator('text=City').click();
      await popover().locator('input').fill('Flagstaff{enter}');
      await popover().locator('text=Add filter').click();

      await expect(page.locator('.DashCard tbody tr')).toHaveCount(1);
    });
  });

  test.describe("native question field filter connected to 'category' parameter", () => {
    test.beforeEach(async () => {
      const filter = {
        id: "c2967a17",
        name: "Category",
        slug: "category",
        type: "category",
      };

      const questionDetails = {
        name: "Products SQL",
        native: {
          query: "select * from products where {{category}}",
          "template-tags": {
            category: {
              "display-name": "Field Filter",
              id: "abc123",
              name: "category",
              type: "dimension",
              "widget-type": "category",
              dimension: ["field", PRODUCTS.CATEGORY, null],
              default: ["Doohickey"],
            },
          },
        },
        display: "table",
      };

      const dashboardDetails = { parameters: [filter] };

      cy.createNativeQuestionAndDashboard({
        questionDetails,
        dashboardDetails,
      }).then(({ body: { id, card_id, dashboard_id } }) => {
        cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
          cards: [
            {
              id,
              card_id,
              row: 0,
              col: 0,
              size_x: 8,
              size_y: 6,
              parameter_mappings: [
                {
                  card_id,
                  parameter_id: "c2967a17",
                  target: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
                },
              ],
            },
          ],
        });

        visitDashboard(dashboard_id);
      });
    });

    test("should work", async ({ page }) => {
      await page.locator('text=Doohickey');

      await page.locator('text=Category').click();
      await popover().locator('text=Gadget').click();
      await popover().locator('text=Add filter').click();

      // verify that the filter is applied
      await expect(page.locator('text=Doohickey')).not.toBeVisible();
    });
  });
});

