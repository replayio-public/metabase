import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  setFilter,
  checkFilterLabelAndValue,
  visitDashboard,
} from "e2e/support/helpers";

import { addWidgetStringFilter } from "../native-filters/helpers/e2e-field-filter-helpers";


test.describe("scenarios > dashboard > filters > ID", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    visitDashboard(1);

    editDashboard();
    setFilter("ID");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Select…").click();
  });
  test.describe("should work for the primary key", () => {
    test.beforeEach(async () => {
      popover().contains("ID").first().click();
    });

    test("when set through the filter widget", async () => {
      saveDashboard();

      filterWidget().click();
      addWidgetStringFilter("15");

      cy.get(".Card").within(() => {
        cy.findByText("114.42");
      });
    });

    test("when set as the default filter", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Default value").next().click();
      addWidgetStringFilter("15");

      saveDashboard();

      cy.get(".Card").within(() => {
        cy.findByText("114.42");
      });
    });
  });

  test.describe("should work for the foreign key", () => {
    test.beforeEach(async () => {
      popover().contains("User ID").click();
    });

    test("when set through the filter widget", async () => {
      saveDashboard();

      filterWidget().click();
      addWidgetStringFilter("4");

      cy.get(".Card").within(() => {
        cy.findByText("47.68");
      });

      checkFilterLabelAndValue("ID", "Arnold Adams - 4");
    });

    test("when set as the default filter", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Default value").next().click();
      addWidgetStringFilter("4");

      saveDashboard();

      cy.get(".Card").within(() => {
        cy.findByText("47.68");
      });

      checkFilterLabelAndValue("ID", "Arnold Adams - 4");
    });
  });

  test.describe("should work on the implicit join", () => {
    test.beforeEach(async () => {
      popover().within(() => {
        cy.findAllByText("ID").last().click();
      });
    });

    test("when set through the filter widget", async () => {
      saveDashboard();

      filterWidget().click();
      addWidgetStringFilter("10");

      cy.get(".Card").within(() => {
        cy.findByText("6.75");
      });
    });

    test("when set as the default filter", async () => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Default value").next().click();
      addWidgetStringFilter("10");

      saveDashboard();

      cy.get(".Card").within(() => {
        cy.findByText("6.75");
      });
    });
  });
});

