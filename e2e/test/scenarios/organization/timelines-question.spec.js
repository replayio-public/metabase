import {
  restore,
  visitQuestion,
  rightSidebar,
  visitQuestionAdhoc,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > organization > timelines > question", () => {
  test.beforeEach(() => {
    restore();
  });

  test.describe("as admin", () => {
    test.beforeEach(() => {
      cy.signInAsAdmin();
      cy.intercept("GET", "/api/collection/root").as("getCollection");
      cy.intercept("POST", "/api/timeline-event").as("createEvent");
      cy.intercept("PUT", "/api/timeline-event/**").as("updateEvent");
    });

    test("should create the first event and timeline", () => {
      visitQuestion(3);
      cy.wait("@getCollection");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Visualization").should("be.visible");

      cy.icon("calendar").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Add an event").click();

      cy.findByLabelText("Event name").type("RC1");
      cy.findByLabelText("Date").type("10/20/2018");
      cy.button("Create").click();
      cy.wait("@createEvent");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Our analytics events").should("be.visible");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("RC1").should("be.visible");
    });

    // ... other tests ...

  });

  // ... other describe blocks ...
});

function toggleEventVisibility(eventName) {
  cy.findByText(eventName)
    .closest("[aria-label=Timeline event card]")
    .within(() => {
      cy.findByRole("checkbox").click();
    });
}
