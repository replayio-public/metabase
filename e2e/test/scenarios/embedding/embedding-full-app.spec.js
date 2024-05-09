import {
  adhocQuestionHash,
  popover,
  appBar,
  restore,
} from "e2e/support/helpers";

test.describe("scenarios > embedding > full app", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", `/api/card/*/query`).as("getCardQuery");
    cy.intercept("POST", "/api/dashboard/**/query").as("getDashCardQuery");
    cy.intercept("GET", `/api/dashboard/*`).as("getDashboard");
    cy.intercept("GET", "/api/automagic-dashboards/**").as("getXrayDashboard");
  });

  test.describe("home page navigation", () => {
    test('should hide the top nav when nothing is shown', () => {
      visitUrl({ url: "/", qs: { side_nav: false, logo: false } });
      appBar().should("not.exist");
    });

    // ... other tests ...

  });

  // ... other describe blocks ...

});

const visitUrl = url => {
  cy.visit({
    ...url,
    onBeforeLoad(window) {
      // cypress runs all tests in an iframe and the app uses this property to avoid embedding mode for all tests
      // by removing the property the app would work in embedding mode
      window.Cypress = undefined;
    },
  });
};

const visitQuestionUrl = url => {
  visitUrl(url);
  cy.wait("@getCardQuery");
};

const visitDashboardUrl = url => {
  visitUrl(url);
  cy.wait("@getDashboard");
  cy.wait("@getDashCardQuery");
};

const visitXrayDashboardUrl = url => {
  visitUrl(url);
  cy.wait("@getXrayDashboard");
};

const addLinkClickBehavior = ({ dashboardId, linkTemplate }) => {
  cy.request("GET", `/api/dashboard/${dashboardId}`).then(({ body }) => {
    cy.request("PUT", `/api/dashboard/${dashboardId}/cards`, {
      cards: body.ordered_cards.map(card => ({
        ...card,
        visualization_settings: {
          click_behavior: {
            type: "link",
            linkType: "url",
            linkTemplate,
          },
        },
      })),
    });
  });
};
