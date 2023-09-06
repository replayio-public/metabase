import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  setFilter,
  visitDashboard,
} from "e2e/support/helpers";

import { addWidgetNumberFilter } from "../native-filters/helpers/e2e-field-filter-helpers";
import { DASHBOARD_NUMBER_FILTERS } from "./shared/dashboard-filters-number";

test.describe("scenarios > dashboard > filters > number", () => {
  test.beforeEach(async () => {
    await restore();
    await cy.signInAsAdmin();

    visitDashboard(1);

    editDashboard();
  });

  test(`should work when set through the filter widget`, async () => {
    for (const [filter] of Object.entries(DASHBOARD_NUMBER_FILTERS)) {
      cy.log(`Make sure we can connect ${filter} filter`);
      setFilter("Number", filter);

      cy.findByText("Select…").click();
      popover().contains("Tax").click();
    }

    saveDashboard();

    let index = 0;
    for (const [filter, { value, representativeResult }] of Object.entries(DASHBOARD_NUMBER_FILTERS)) {
      filterWidget().eq(index).click();
      addWidgetNumberFilter(value);

      cy.log(`Make sure ${filter} filter returns correct result`);
      cy.get(".Card").within(() => {
        cy.findByText(representativeResult);
      });

      clearFilter(index);
      index++;
    }
  });

  test(`should work when set as the default filter`, async () => {
    setFilter("Number", "Equal to");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Default value").next().click();

    addWidgetNumberFilter("2.07");

    saveDashboard();

    cy.get(".Card").within(() => {
      cy.findByText("37.65");
    });

    filterWidget().find(".Icon-close").click();

    filterWidget().click();

    addWidgetNumberFilter("5.27");

    cy.get(".Card").within(() => {
      cy.findByText("101.04");
    });
  });
});

async function clearFilter(index = 0) {
  console.log(cy.state());
  filterWidget().eq(index).find(".Icon-close").click();
  cy.wait("@dashcardQuery1");
}
