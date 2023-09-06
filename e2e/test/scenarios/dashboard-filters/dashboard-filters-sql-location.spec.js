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

import { addWidgetStringFilter } from "../native-filters/helpers/e2e-field-filter-helpers";
import {
  DASHBOARD_SQL_LOCATION_FILTERS,
  questionDetails,
} from "./shared/dashboard-filters-sql-location";


test.describe("scenarios > dashboard > filters > location", () => {
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
    Object.entries(DASHBOARD_SQL_LOCATION_FILTERS).forEach(([filter]) => {
      setFilter("Location", filter);

      await page.locator('text=Select…').click();
      popover().contains(filter).click();
    });

    saveDashboard();

    Object.entries(DASHBOARD_SQL_LOCATION_FILTERS).forEach(
      ([filter, { value, representativeResult }], index) => {
        filterWidget().eq(index).click();
        addWidgetStringFilter(value);

        page.locator('.Card').within(() => {
          page.locator(`text=${representativeResult}`);
        });

        clearFilter(index);
      },
    );
  });

  test(`should work when set as the default filter`, async ({ page }) => {
    setFilter("Location", "Is");

    await page.locator('text=Select…').click();
    popover().contains("Is").click();

    await page.locator('text=Default value').next().click();

    addWidgetStringFilter("Rye");

    saveDashboard();

    page.locator('.Card').within(() => {
      page.locator('text=Arnold Adams');
    });

    filterWidget().find(".Icon-close").click();

    await expect(page.url()).not.toContain("Rye");

    filterWidget().click();

    addWidgetStringFilter("Pittsburg");

    page.locator('.Card').within(() => {
      page.locator('text=Aracely Jenkins');
    });
  });
});



async function clearFilter(index) {
  await filterWidget().eq(index).locator(".Icon-close").click();
  cy.wait("@dashcardQuery2");
}

