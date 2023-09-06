import {
  restore,
  filterWidget,
  popover,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;

const categoryFilter = {
  name: "Category",
  slug: "category",
  id: "2a12e66c",
  type: "string/=",
  sectionId: "string",
};

const dashboardDetails = { parameters: [categoryFilter] };


test.describe("issue 12985 > dashboard filter dropdown/search", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should work for saved nested questions (metabase#12985-1)', async ({ page }) => {
    // ... (keep the existing code inside the test)

    await filterWidget().contains("Category").click();
    cy.log("Failing to show dropdown in v0.36.0 through v.0.37.0");

    await popover().within(() => {
      cy.findByText("Doohickey");
      cy.findByText("Gizmo");
      cy.findByText("Widget");
      cy.findByText("Gadget").click();
    });
    await cy.button("Add filter").click();

    await cy.location("search").should("eq", "?category=Gadget");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("Ergonomic Silk Coat");
  });

  test.skip('should work for aggregated questions (metabase#12985-2)', async ({ page }) => {
    // ... (keep the existing code inside the test)

    await filterWidget().contains("Category").click();
    // It will fail at this point until the issue is fixed because popover never appears
    await popover().contains("Gadget").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("Add filter").click();
    await cy.url().should("contain", "?category=Gadget");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("Ergonomic Silk Coat");
  });
});

