import {
  restore,
  modal,
  popover,
  describeEE,
  getFullName,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;
const { admin, nodata } = USERS;

const adminFullName = getFullName(admin);
const ADMIN_ID = 1;

const getQuestionDetails = () => ({
  name: "Test Question",
  query: {
    "source-table": ORDERS_ID,
  },
});

const getAlertDetails = ({ card_id, user_id }) => ({
  card: {
    id: card_id,
    include_csv: false,
    include_xls: false,
  },
  channels: [
    {
      enabled: true,
      channel_type: "email",
      schedule_type: "hourly",
      recipients: [
        {
          id: user_id,
        },
      ],
    },
  ],
});

const getSubscriptionsDetails = ({ card_id, dashboard_id, user_id }) => ({
  name: "Subscription",
  dashboard_id,
  cards: [
    {
      id: card_id,
      include_csv: false,
      include_xls: false,
    },
  ],
  channels: [
    {
      enabled: true,
      channel_type: "email",
      schedule_type: "hourly",
      recipients: [
        {
          id: user_id,
        },
      ],
    },
  ],
});

describeEE("audit > auditing > subscriptions", (() => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test.describe('subscriptions', () => {
    test.beforeEach(async () => {
      cy.getCurrentUser().then(({ body: { id: user_id } }) => {
        cy.createQuestionAndDashboard({
          questionDetails: getQuestionDetails(),
        }).then(({ body: { card_id, dashboard_id } }) => {
          cy.wrap(dashboard_id).as("dashboardId");

          cy.createPulse(
            getSubscriptionsDetails({ card_id, dashboard_id, user_id }),
          );
        });
      });

      cy.visit("/admin/audit/subscriptions");
    });

    test('shows subscriptions', () => {
      cy.get("tbody").within(() => {
        cy.findByText("Test Dashboard"); // Dashboard name
        cy.findByText("Our analytics"); // Collection
        cy.findByText("Every hour"); // Frequency
        cy.findByText(adminFullName); // Author
        cy.findByText("Email"); // Type
      });
    });

    test('opens a dashboard audit page when question title clicked', () => {
      cy.get("tbody").within(() => {
        cy.findByText("Test Dashboard").click();
        cy.get("@dashboardId").then(id => {
          cy.url().should("include", `/admin/audit/dashboard/${id}/activity`);
        });
      });
    });

    test('opens a user audit page when question title clicked', () => {
      cy.get("tbody").within(() => {
        cy.findByText(adminFullName).click();
        cy.url().should("include", `/admin/audit/member/${ADMIN_ID}/activity`);
      });
    });

    test('allows to delete subscriptions', testRemovingAuditItem);

    test('allows to edit recipients', () => {
      testEditingRecipients({
        editModalHeader: "Subscription recipients",
      });
    });
  });

  test.describe('alerts', () => {
    test.beforeEach(async () => {
      cy.getCurrentUser().then(({ body: { id: user_id } }) => {
        cy.createQuestion(getQuestionDetails()).then(
          ({ body: { id: card_id } }) => {
            cy.createAlert(getAlertDetails({ card_id, user_id }));
          },
        );
      });

      cy.visit("/admin/audit/subscriptions/alerts");
    });

    test('shows alerts', () => {
      cy.get("tbody").within(() => {
        cy.findByText("Test Question"); // Question name
        cy.findByText("Our analytics"); // Collection
        cy.findByText("Every hour"); // Frequency
        cy.findByText(adminFullName); // Author
        cy.findByText("Email"); // Type
      });
    });

    test('opens a question audit page when question title clicked', () => {
      cy.get("tbody").within(() => {
        cy.findByText("Test Question").click();
        cy.url().should("include", "/admin/audit/question/4/activity");
      });
    });

    test('opens a user audit page when question title clicked', () => {
      cy.get("tbody").within(() => {
        cy.findByText(adminFullName).click();
        cy.url().should("include", `/admin/audit/member/${ADMIN_ID}/activity`);
      });
    });

    test('allows to delete alerts', testRemovingAuditItem);

    test('allows to edit recipients', () => {
      testEditingRecipients({
        editModalHeader: "Test Question alert recipients",
      });
    });
  });
}));

async function testRemovingAuditItem() {
  await cy.get("tbody").within(async () => {
    await cy.icon("close").click();
  });

  await modal().within(async () => {
    await cy.findByText("Delete this alert?");
    await cy.button("Delete").should("be.disabled");

    await cy.findByText("This alert will no longer be emailed hourly.").click();
    await cy.button("Delete").click();
  });

  await cy.findByText("No results");
}

async function testEditingRecipients({ editModalHeader }) {
  await cy.get("tbody > tr > td").eq(1).as("recipients").click();

  await modal().within(async () => {
    await cy.findByText(editModalHeader);
    await cy.findByText(adminFullName);

    await cy.icon("close").eq(1).click(); // Remove admin user

    await cy.get("input").click();
  });

  await popover().within(async () => {
    await cy.findByText(getFullName(nodata)).click(); // Add No Data user
  });

  await modal().within(async () => {
    await cy.get("input").type("another-recipient@metabase.com{enter}"); // Add email
    await cy.button("Update").click();
  });

  await modal().should("not.exist");

  await cy.get("@recipients").should("have.text", "2");
}
