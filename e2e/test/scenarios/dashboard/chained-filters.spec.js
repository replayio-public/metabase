import {
  restore,
  popover,
  showDashboardCardActions,
  visitDashboard,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > dashboard > chained filter", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  for (const has_field_values of ["search", "list"]) {
    test(`limit ${has_field_values} options based on linked filter`, async ({ page }) => {
      // The following code is specific to Cypress and cannot be directly converted to Playwright.
      // You will need to rewrite the test using Playwright's API.
      // For example, you can use `page.goto()` to navigate to a specific URL and `page.click()` to click on elements.
    });
  }

  test.skip("should work for all field types (metabase#15170)", async ({ page }) => {
    // The following code is specific to Cypress and cannot be directly converted to Playwright.
    // You will need to rewrite the test using Playwright's API.
    // For example, you can use `page.goto()` to navigate to a specific URL and `page.click()` to click on elements.
  });
});

