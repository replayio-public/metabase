import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  setFilter,
  visitDashboard,
} from "e2e/support/helpers";

import { addWidgetStringFilter } from "../native-filters/helpers/e2e-field-filter-helpers";
import { DASHBOARD_LOCATION_FILTERS } from "./shared/dashboard-filters-location";


test.describe("scenarios > dashboard > filters > location", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    visitDashboard(1);

    editDashboard();
  });

  test(`should work when set through the filter widget`, async ({ page }) => {
    for (const [filter] of Object.entries(DASHBOARD_LOCATION_FILTERS)) {
      test.log(`Make sure we can connect ${filter} filter`);
      setFilter("Location", filter);

      await page.locator('text=Select…').click();
      popover().contains("City").click();
    }
    saveDashboard();

    for (const [filter, { value, representativeResult }] of Object.entries(DASHBOARD_LOCATION_FILTERS)) {
      filterWidget().click();
      addWidgetStringFilter(value);

      test.log(`Make sure ${filter} filter returns correct result`);
      await page.locator('.Card').within(() => {
        page.locator(`text=${representativeResult}`);
      });

      clearFilter();
    }
  });

  test(`should work when set as the default filter`, async ({ page }) => {
    setFilter("Location", "Is");
    await page.locator('text=Select…').click();
    popover().contains("City").click();

    await page.locator('text=Default value').next().click();

    addWidgetStringFilter("Abbeville");

    saveDashboard();

    await page.locator(".Card").within(() => {
      page.locator("text=1510");
    });
  });
});


async function clearFilter(index = 0) {
  await filterWidget().nth(index).locator(".Icon-close").click();
  await page.waitForResponse("@dashcardQuery1");
}
