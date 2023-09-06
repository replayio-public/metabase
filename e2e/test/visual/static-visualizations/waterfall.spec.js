import {
  restore,
  setupSMTP,
  openEmailPage,
  sendSubscriptionsEmail,
  visitDashboard,
} from "e2e/support/helpers";

import { USERS, SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { admin } = USERS;


test.describe("static visualizations", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    setupSMTP();
  });

  test("waterfall chart", async () => {
    const dashboardName = "Waterfall charts dashboard";
    cy.createDashboardWithQuestions({
      dashboardName,
      questions: [
        createWaterfallQuestion(),
        createWaterfallQuestion({ showTotal: true }),
        createWaterfallQuestion({ showTotal: false }),
      ],
    }).then(({ dashboard }) => {
      visitDashboard(dashboard.id);

      sendSubscriptionsEmail(`${admin.first_name} ${admin.last_name}`);

      openEmailPage(dashboardName).then(() => {
        cy.createPercySnapshot();
      });
    });
  });
});


function createWaterfallQuestion({ showTotal } = {}) {
  const query = {
    name: `waterfall showTotal=${showTotal}`,
    native: {
      query:
        "SELECT * FROM ( VALUES ('Stage 1', 10), ('Stage 2', 30), ('Stage 3', -50), ('Stage 4', -10), ('Stage 5', 80), ('Stage 6', 10), ('Stage 7', 15))",
      "template-tags": {},
    },
    visualization_settings: {
      "graph.show_values": true,
    },
    display: "waterfall",
    database: SAMPLE_DB_ID,
  };

  if (typeof showTotal !== "undefined") {
    query.visualization_settings["waterfall.show_total"] = showTotal;
  }

  return query;
}
