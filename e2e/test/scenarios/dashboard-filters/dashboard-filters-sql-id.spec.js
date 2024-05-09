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

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

import { addWidgetStringFilter } from "../native-filters/helpers/e2e-field-filter-helpers";

const { ORDERS } = SAMPLE_DATABASE;

test.describe("scenarios > dashboard > filters > SQL > ID", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test.describe("should work for the primary key", () => {
    test.beforeEach(async () => {
      prepareDashboardWithFilterConnectedTo(ORDERS.ID);
    });

    test('when set through the filter widget', async ({ page }) => {
      saveDashboard();

      await filterWidget().click();
      addWidgetStringFilter("15");

      await page.locator(".Card").within(() => {
        page.locator().findByText("114.42");
      });
    });

    test('when set as the default filter', async ({ page }) => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Default value").next().click();
      addWidgetStringFilter("15");

      saveDashboard();

      await page.locator(".Card").within(() => {
        page.locator().findByText("114.42");
      });
    });
  });

  test.describe("should work for the foreign key", () => {
    test.beforeEach(async () => {
      prepareDashboardWithFilterConnectedTo(ORDERS.USER_ID);
    });

    test('when set through the filter widget', async ({ page }) => {
      saveDashboard();

      await filterWidget().click();
      addWidgetStringFilter("4");

      await page.locator(".Card").within(() => {
        page.locator().findByText("47.68");
      });
    });

    test('when set as the default filter', async ({ page }) => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Default value").next().click();
      addWidgetStringFilter("4");

      saveDashboard();

      await page.locator(".Card").within(() => {
        page.locator().findByText("47.68");
      });
    });
  });
});

async function prepareDashboardWithFilterConnectedTo(rowId) {
  const questionDetails = {
    name: "SQL with ID filter",
    native: {
      query: "select * from ORDERS where {{filter}}",
      "template-tags": {
        filter: {
          id: "3ff86eea-2559-5ab7-af10-e532a54661c5",
          name: "filter",
          "display-name": "Filter",
          type: "dimension",
          dimension: ["field", rowId, null],
          "widget-type": "id",
          default: null,
        },
      },
    },
  };

  const { card_id, dashboard_id } = await cy.createNativeQuestionAndDashboard({ questionDetails });

  visitQuestion(card_id);

  visitDashboard(dashboard_id);

  editDashboard();
  setFilter("ID");

  await page.locator("text=Select…").click();
  await popover().contains("Filter").click();
}
