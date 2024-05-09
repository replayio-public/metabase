import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  setFilter,
  visitQuestion,
  visitDashboard,
} from "e2e/support/helpers";

import { applyFilterByType } from "../native-filters/helpers/e2e-field-filter-helpers";
import {
  DASHBOARD_SQL_TEXT_FILTERS,
  questionDetails,
} from "./shared/dashboard-filters-sql-text-category";


test.describe("scenarios > dashboard > filters > SQL > text/category", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestionAndDashboard({ questionDetails }).then(
      ({ body: { card_id, dashboard_id } }) => {
        visitQuestion(card_id);

        visitDashboard(dashboard_id);
      },
    );

    editDashboard();
  });

  test(`should work when set through the filter widget`, async ({ page }) => {
    Object.entries(DASHBOARD_SQL_TEXT_FILTERS).forEach(([filter]) => {
      cy.log(`Make sure we can connect ${filter} filter`);
      setFilter("Text or Category", filter);

      await page.locator('text=Select…').click();
      popover().contains(filter).click();
    });

    saveDashboard();

    Object.entries(DASHBOARD_SQL_TEXT_FILTERS).forEach(
      ([filter, { value, representativeResult }], index) => {
        filterWidget().eq(index).click();
        applyFilterByType(filter, value);

        cy.log(`Make sure ${filter} filter returns correct result`);
        cy.get(".Card").within(() => {
          cy.contains(representativeResult);
        });

        clearFilter(index);
      },
    );
  });

  test(`should work when set as the default filter and when that filter is removed (metabase#20493)`, async ({ page }) => {
    setFilter("Text or Category", "Is");

    await page.locator('text=Select…').click();
    popover().contains("Is").click();

    await page.locator('text=Default value').next().click();

    applyFilterByType("Is", "Gizmo");

    saveDashboard();

    cy.get(".Card").within(() => {
      cy.contains("Rustic Paper Wallet");
    });

    filterWidget().find(".Icon-close").click();

    cy.url().should("not.include", "Gizmo");

    filterWidget().click();

    applyFilterByType("Is", "Doohickey");

    cy.findByText("Rustic Paper Wallet").should("not.exist");
  });
});



async function clearFilter(index) {
  await filterWidget().eq(index).locator('.Icon-close').click();
  cy.wait("@dashcardQuery2");
}

