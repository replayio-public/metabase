import { TEST_DASHBOARD_STATE } from "../components/DashboardTabs/test-utils";
import { moveTab, tabsReducer } from "./tabs";

/**
 * It's prefererd to write tests in `DashboardTabs.unit.spec.tsx`,
 * only write tests here for things that are not easily testable at the component level or in Cypress.
 */
describe("tabsReducer", () => {
  it("should reorder the tabs when MOVE_TAB is dispatched", () => {
    const newDashState = tabsReducer(
      TEST_DASHBOARD_STATE,
      moveTab({ sourceTabId: 1, destTabId: 3 }),
    );
    expect(newDashState.dashboards[1].ordered_tabs?.map(t => t.id)).toEqual([
      2, 3, 1,
    ]);
  });
});
