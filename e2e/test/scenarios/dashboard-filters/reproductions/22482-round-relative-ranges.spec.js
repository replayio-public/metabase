import moment from "moment-timezone";
import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  setFilter,
  visitDashboard,
} from "e2e/support/helpers";


test.describe("issue 22482", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitDashboard(1);

    editDashboard();
    setFilter("Time", "All Options");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Select…"');
    popover().contains("Created At").eq(0).click();

    saveDashboard();

    filterWidget().click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Relative dates..."');
  });

  test("should round relative date range (metabase#22482)", async ({ page }) => {
    await page.locator('[data-testid="relative-datetime-value"]').clear().type(15);
    await page.locator('[data-testid="relative-datetime-unit"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="months"');

    const expectedRange = getFormattedRange(
      moment().startOf("month").add(-15, "month"),
      moment().add(-1, "month").endOf("month"),
    );

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page).toHaveText(expectedRange);
  });
});

function getFormattedRange(start, end) {
  return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
}
