import {
  dashboardHeader,
  dashboardParametersContainer,
  describeWithSnowplow,
  editDashboard,
  enableTracking,
  expectGoodSnowplowEvents,
  expectNoBadSnowplowEvents,
  filterWidget,
  getDashboardCard,
  popover,
  resetSnowplow,
  restore,
  rightSidebar,
  saveDashboard,
  sidebar,
  undoToast,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const FILTER = {
  name: "Category",
  slug: "category",
  id: "2a12e66c",
  type: "string/=",
  sectionId: "string",
};

const QUESTION_DETAILS = {
  name: "Products table",
  query: { "source-table": PRODUCTS_ID },
};

const DASHBOARD_DETAILS = {
  parameters: [FILTER],
};

const TOAST_TIMEOUT = 20000;

const TOAST_MESSAGE =
  "You can make this dashboard snappier by turning off auto-applying filters.";

test.describe("scenarios > dashboards > filters > auto apply", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
    cy.intercept("PUT", "/api/dashboard/*").as("updateDashboard");
  });

  test('should handle toggling auto applying filters on and off', async ({ page }) => {
    createDashboard();
    openDashboard();
    await page.waitForResponse("@cardQuery");

    // changing parameter values by default should reload affected questions
    filterWidget().within(() => {
      cy.findByText(FILTER.name).click();
    });
    popover().within(() => {
      cy.findByText("Gadget").click();
      cy.button("Add filter").click();
      cy.wait("@cardQuery");
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 53").should("be.visible");
    });

    // parameter values should be preserved when disabling auto applying filters
    dashboardHeader().within(() => {
      cy.icon("info").click();
    });
    rightSidebar().within(() => {
      cy.findByLabelText("Auto-apply filters").click();
      cy.wait("@updateDashboard");
      cy.findByLabelText("Auto-apply filters").should("not.be.checked");
    });
    filterWidget().within(() => {
      cy.findByText("Gadget").should("be.visible");
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 53").should("be.visible");
    });

    // draft parameter values should be applied manually
    filterWidget().within(() => {
      cy.findByText("Gadget").click();
    });
    popover().within(() => {
      cy.findByText("Widget").click();
      cy.button("Update filter").click();
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 53").should("be.visible");
    });
    dashboardParametersContainer().within(() => {
      cy.button("Apply").click();
      cy.wait("@cardQuery");
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 107").should("be.visible");
    });

    // draft parameter values should be discarded when enabling auto-applying filters
    filterWidget().within(() => {
      cy.findByText("2 selections").click();
    });
    popover().within(() => {
      cy.findByText("Gadget").click();
      cy.button("Update filter").click();
    });
    filterWidget().within(() => {
      cy.findByText("Widget").should("be.visible");
    });
    dashboardParametersContainer().within(() => {
      cy.button("Apply").should("be.visible");
    });
    rightSidebar().within(() => {
      cy.findByLabelText("Auto-apply filters").click();
      cy.wait("@updateDashboard");
      cy.findByLabelText("Auto-apply filters").should("be.checked");
    });
    filterWidget().within(() => {
      cy.findByText("2 selections").should("be.visible");
      cy.get("@cardQuery.all").should("have.length", 3);
    });

    // last applied parameter values should be used when disabling auto applying filters,
    // even if previously there were draft parameter values
    rightSidebar().within(() => {
      cy.findByLabelText("Auto-apply filters").click();
      cy.wait("@updateDashboard");
      cy.findByLabelText("Auto-apply filters").should("not.be.checked");
    });
    filterWidget().within(() => {
      cy.findByText("2 selections").should("be.visible");
      cy.get("@cardQuery.all").should("have.length", 3);
    });
  });

  test('should not preserve draft parameter values when editing the dashboard', async ({ page }) => {
    createDashboard({ auto_apply_filters: false });
    openDashboard();

    filterWidget().within(() => {
      cy.findByText(FILTER.name).click();
    });
    popover().within(() => {
      cy.findByText("Gadget").click();
      cy.button("Add filter").click();
    });
    dashboardParametersContainer().within(() => {
      cy.button("Apply").should("be.visible");
    });

    editDashboard();
    dashboardHeader().within(() => {
      cy.icon("filter").click();
    });
    popover().within(() => {
      cy.findByText("Text or Category").click();
      cy.findByText("Is").click();
    });
    sidebar().within(() => {
      cy.findByDisplayValue("Text").clear().type("Vendor");
    });
    getDashboardCard().within(() => {
      cy.findByText("Select…").click();
    });
    popover().within(() => {
      cy.findByText("Vendor").click();
    });
    saveDashboard();

    dashboardParametersContainer().within(() => {
      cy.findByText("Category").should("be.visible");
      cy.findByText("Vendor").should("be.visible");
      cy.findByText("Gadget").should("not.exist");
      cy.button("Apply").should("not.exist");
    });
  });

  test('should preserve draft parameter values when editing of the dashboard was cancelled', async ({ page }) => {
    createDashboard({ auto_apply_filters: false });
    openDashboard();

    filterWidget().within(() => {
      cy.findByText(FILTER.name).click();
    });
    popover().within(() => {
      cy.findByText("Gadget").click();
      cy.button("Add filter").click();
    });
    dashboardParametersContainer().within(() => {
      cy.button("Apply").should("be.visible");
    });

    editDashboard();
    dashboardHeader().within(() => {
      cy.button("Cancel").click();
    });
    filterWidget().within(() => {
      cy.findByText("Gadget").should("be.visible");
    });
    dashboardParametersContainer().within(() => {
      cy.button("Apply").should("be.visible");
    });
  });

  test('should display a toast when a dashboard takes longer than 15s to load', async ({ page }) => {
    cy.clock();
    createDashboard();
    openSlowDashboard({ [FILTER.slug]: "Gadget" });

    cy.tick(TOAST_TIMEOUT);
    cy.wait("@cardQuery");
    undoToast().within(() => {
      cy.findByText(TOAST_MESSAGE).should("be.visible");
      cy.button("Turn off").click();
      cy.wait("@updateDashboard");
    });
    dashboardHeader().within(() => {
      cy.icon("info").click();
    });
    rightSidebar().within(() => {
      cy.findByLabelText("Auto-apply filters").should("not.be.checked");
    });
    filterWidget().within(() => {
      cy.findByText("Gadget").should("be.visible");
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 53").should("be.visible");
    });
  });

  test('should not display the toast when auto applying filters is disabled', async ({ page }) => {
    cy.clock();
    createDashboard({ auto_apply_filters: false });
    openSlowDashboard({ [FILTER.slug]: "Gadget" });

    cy.tick(TOAST_TIMEOUT);
    cy.wait("@cardQuery");
    undoToast().should("not.exist");
    filterWidget().within(() => {
      cy.findByText("Gadget").should("be.visible");
    });
    getDashboardCard().within(() => {
      cy.findByText("Rows 1-6 of 53").should("be.visible");
    });
  });

  test('should not display the toast if there are no parameter values', async ({ page }) => {
    cy.clock();
    createDashboard();
    openSlowDashboard();

    cy.tick(TOAST_TIMEOUT);
    cy.wait("@cardQuery");
    undoToast().should("not.exist");
  });

  test('should not display the same toast twice for a dashboard', async ({ page }) => {
    cy.clock();
    createDashboard();
    openSlowDashboard({ [FILTER.slug]: "Gadget" });

    cy.tick(TOAST_TIMEOUT);
    cy.wait("@cardQuery");
    undoToast().within(() => {
      cy.button("Turn off").should("be.visible");
      cy.icon("close").click();
    });
    filterWidget().within(() => {
      cy.findByText("Gadget").click();
    });
    popover().within(() => {
      cy.findByText("Widget").click();
      cy.findByText("Update filter").click();
    });

    cy.tick(TOAST_TIMEOUT);
    cy.wait("@cardQuery");
    undoToast().should("not.exist");
  });
});

describeWithSnowplow("scenarios > dashboards > filters > auto apply", () => {
  const NUMBERS_OF_GOOD_SNOWPLOW_EVENTS_BEFORE_DISABLING_AUTO_APPLY_FILTERS = 2;
  test.beforeEach(async () => {
    restore();
    resetSnowplow();
    cy.signInAsAdmin();
    enableTracking();
    cy.intercept("PUT", "/api/dashboard/*").as("updateDashboard");
  });

  test.afterEach(() => {
    expectNoBadSnowplowEvents();
  });

  test('should send snowplow events when disabling auto-apply filters', async ({ page }) => {
    createDashboard();
    openDashboard();
    await page.waitForResponse("@cardQuery");

    dashboardHeader().within(() => {
      cy.icon("info").click();
    });
    rightSidebar().within(() => {
      expectGoodSnowplowEvents(
        NUMBERS_OF_GOOD_SNOWPLOW_EVENTS_BEFORE_DISABLING_AUTO_APPLY_FILTERS,
      );
      cy.findByLabelText("Auto-apply filters").click();
      cy.wait("@updateDashboard");
      cy.findByLabelText("Auto-apply filters").should("not.be.checked");
      expectGoodSnowplowEvents(
        NUMBERS_OF_GOOD_SNOWPLOW_EVENTS_BEFORE_DISABLING_AUTO_APPLY_FILTERS + 1,
      );
    });
  });

  test('should not send snowplow events when enabling auto-apply filters', async ({ page }) => {
    createDashboard({ auto_apply_filters: false });
    openDashboard();
    await page.waitForResponse("@cardQuery");

    dashboardHeader().within(() => {
      cy.icon("info").click();
    });
    rightSidebar().within(() => {
      expectGoodSnowplowEvents(
        NUMBERS_OF_GOOD_SNOWPLOW_EVENTS_BEFORE_DISABLING_AUTO_APPLY_FILTERS,
      );
      cy.findByLabelText("Auto-apply filters").click();
      cy.wait("@updateDashboard");
      cy.findByLabelText("Auto-apply filters").should("be.checked");
      expectGoodSnowplowEvents(
        NUMBERS_OF_GOOD_SNOWPLOW_EVENTS_BEFORE_DISABLING_AUTO_APPLY_FILTERS,
      );
    });
  });
});

const createDashboard = (dashboardOpts = {}) => {
  cy.createQuestionAndDashboard({
    questionDetails: QUESTION_DETAILS,
    dashboardDetails: { ...DASHBOARD_DETAILS, ...dashboardOpts },
  }).then(({ body: card }) => {
    cy.editDashboardCard(card, getParameterMapping(card));
    cy.wrap(card.dashboard_id).as("dashboardId");
  });
};

const getParameterMapping = ({ card_id }) => ({
  parameter_mappings: [
    {
      card_id,
      parameter_id: FILTER.id,
      target: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
    },
  ],
});

const openDashboard = (params = {}) => {
  cy.intercept("POST", "/api/dashboard/*/dashcard/*/card/*/query").as(
    "cardQuery",
  );

  cy.get("@dashboardId").then(dashboardId => {
    visitDashboard(dashboardId, { params });
  });
};

const openSlowDashboard = (params = {}) => {
  cy.intercept("POST", "/api/dashboard/*/dashcard/*/card/*/query", req => {
    return Cypress.Promise.delay().then(() => req.reply());
  }).as("cardQuery");

  cy.get("@dashboardId").then(dashboardId => {
    return cy.visit({
      url: `/dashboard/${dashboardId}`,
      qs: params,
    });
  });

  getDashboardCard().should("be.visible");
};
