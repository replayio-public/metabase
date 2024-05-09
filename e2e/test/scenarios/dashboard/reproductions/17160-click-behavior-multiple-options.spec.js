import {
  addOrUpdateDashboardCard,
  restore,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const TARGET_DASHBOARD_NAME = "Target dashboard";
const CATEGORY_FILTER_PARAMETER_ID = "7c9ege62";

test.describe("issue 17160", () => {
  test.beforeEach(async () => {
    test.intercept("POST", "/api/card/*/query").as("cardQuery");

    restore();
    test.signInAsAdmin();
  });

  test('should pass multiple filter values to questions and dashboards (metabase#17160-1)', async () => {
    setup();

    // 1. Check click behavior connected to a question
    visitSourceDashboard();

    test.findAllByText("click-behavior-question-label").eq(0).click();
    test.wait("@cardQuery");

    test.url().should("include", "/question");

    assertMultipleValuesFilterState();

    // 2. Check click behavior connected to a dashboard
    visitSourceDashboard();

    test.get("@targetDashboardId").then(id => {
      test.intercept("POST", `/api/dashboard/${id}/dashcard/*/card/*/query`).as(
        "targetDashcardQuery",
      );

      test.findAllByText("click-behavior-dashboard-label").eq(0).click();
      test.wait("@targetDashcardQuery");
    });

    test.url().should("include", "/dashboard");
    test.location("search").should("eq", "?category=Doohickey&category=Gadget");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    test.findByText(TARGET_DASHBOARD_NAME);

    assertMultipleValuesFilterState();
  });

  test.skip('should pass multiple filter values to public questions and dashboards (metabase#17160-2)', async () => {
    // FIXME: setup public dashboards
    setup();

    // 1. Check click behavior connected to a public question
    visitPublicSourceDashboard();

    test.findAllByText("click-behavior-question-label").eq(0).click();

    test.url().should("include", "/public/question");

    assertMultipleValuesFilterState();

    // 2. Check click behavior connected to a publicdashboard
    visitPublicSourceDashboard();

    test.findAllByText("click-behavior-dashboard-label").eq(0).click();

    test.url().should("include", "/public/dashboard");
    test.location("search").should("eq", "?category=Doohickey&category=Gadget");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    test.findByText(TARGET_DASHBOARD_NAME);

    assertMultipleValuesFilterState();
  });
});

async function assertMultipleValuesFilterState() {
  test.findByText("2 selections").click();

  test.findByTestId("Doohickey-filter-value").within(() =>
    test.get("input").should("be.checked"),
  );
  test.findByTestId("Gadget-filter-value").within(() =>
    test.get("input").should("be.checked"),
  );
}

async function setup() {
  test.createNativeQuestion({
    name: `17160Q`,
    native: {
      query: "SELECT * FROM products WHERE {{CATEGORY}}",
      "template-tags": {
        CATEGORY: {
          id: "6b8b10ef-0104-1047-1e1b-2492d5954322",
          name: "CATEGORY",
          display_name: "CATEGORY",
          type: "dimension",
          dimension: ["field", PRODUCTS.CATEGORY, null],
          "widget-type": "category",
          default: null,
        },
      },
    },
  }).then(({ body: { id: questionId } }) => {
    // Share the question
    test.request("POST", `/api/card/${questionId}/public_link`);

    test.createDashboard({ name: "17160D" }).then(
      ({ body: { id: dashboardId } }) => {
        // Share the dashboard
        test.request("POST", `/api/dashboard/${dashboardId}/public_link`).then(
          ({ body: { uuid } }) => {
            test.wrap(uuid).as("sourceDashboardUUID");
          },
        );
        test.wrap(dashboardId).as("sourceDashboardId");

        // Add the question to the dashboard
        addOrUpdateDashboardCard({
          dashboard_id: dashboardId,
          card_id: questionId,
        }).then(({ body: { id: dashCardId } }) => {
          // Add dashboard filter
          test.request("PUT", `/api/dashboard/${dashboardId}`, {
            parameters: [
              {
                default: ["Doohickey", "Gadget"],
                id: CATEGORY_FILTER_PARAMETER_ID,
                name: "Category",
                slug: "category",
                sectionId: "string",
                type: "string/=",
              },
            ],
          });

          createTargetDashboard().then(targetDashboardId => {
            test.intercept("GET", `/api/dashboard/${targetDashboardId}`).as(
              "targetDashboardLoaded",
            );

            test.wrap(targetDashboardId).as("targetDashboardId");

            // Create a click behaviour for the question card
            test.request("PUT", `/api/dashboard/${dashboardId}/cards`, {
              cards: [
                {
                  id: dashCardId,
                  card_id: questionId,
                  row: 0,
                  col: 0,
                  size_x: 12,
                  size_y: 10,
                  parameter_mappings: [
                    {
                      parameter_id: CATEGORY_FILTER_PARAMETER_ID,
                      card_id: 4,
                      target: ["dimension", ["template-tag", "CATEGORY"]],
                    },
                  ],
                  visualization_settings: getVisualSettingsWithClickBehavior(
                    questionId,
                    targetDashboardId,
                  ),
                },
              ],
            });
          });
        });
      },
    );
  });
}

function getVisualSettingsWithClickBehavior(questionTarget, dashboardTarget) {
  return {
    column_settings: {
      '["name","ID"]': {
        click_behavior: {
          targetId: questionTarget,
          parameterMapping: {
            "6b8b10ef-0104-1047-1e1b-2492d5954322": {
              source: {
                type: "parameter",
                id: CATEGORY_FILTER_PARAMETER_ID,
                name: "Category",
              },
              target: {
                type: "variable",
                id: "CATEGORY",
              },
              id: "6b8b10ef-0104-1047-1e1b-2492d5954322",
            },
          },
          linkType: "question",
          type: "link",
          linkTextTemplate: "click-behavior-question-label",
        },
      },

      '["name","EAN"]': {
        click_behavior: {
          targetId: dashboardTarget,
          parameterMapping: {
            dd19ec03: {
              source: {
                type: "parameter",
                id: CATEGORY_FILTER_PARAMETER_ID,
                name: "Category",
              },
              target: {
                type: "parameter",
                id: "dd19ec03",
              },
              id: "dd19ec03",
            },
          },
          linkType: "dashboard",
          type: "link",
          linkTextTemplate: "click-behavior-dashboard-label",
        },
      },
    },
  };
}

async function createTargetDashboard() {
  return test
    .createQuestionAndDashboard({
      dashboardDetails: {
        name: TARGET_DASHBOARD_NAME,
      },
      questionDetails: {
        query: {
          "source-table": PRODUCTS_ID,
        },
      },
    })
    .then(({ body: { id, card_id, dashboard_id } }) => {
      // Share the dashboard
      test.request("POST", `/api/dashboard/${dashboard_id}/public_link`);

      // Add a filter
      test.request("PUT", `/api/dashboard/${dashboard_id}`, {
        parameters: [
          {
            name: "Category",
            slug: "category",
            id: "dd19ec03",
            type: "string/=",
            sectionId: "string",
          },
        ],
      });

      // Resize the question card and connect the filter to it
      return test
        .request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
          cards: [
            {
              id,
              card_id,
              row: 0,
              col: 0,
              size_x: 12,
              size_y: 10,
              parameter_mappings: [
                {
                  parameter_id: "dd19ec03",
                  card_id,
                  target: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
                },
              ],
            },
          ],
        })
        .then(() => {
          return dashboard_id;
        });
    });
}

async function visitSourceDashboard() {
  test.get("@sourceDashboardId").then(id => {
    visitDashboard(id);
    test.wait("@targetDashboardLoaded");
  });
}

async function visitPublicSourceDashboard() {
  test.get("@sourceDashboardUUID").then(uuid => {
    test.visit(`/public/dashboard/${uuid}`);

    test.findByTextEnsureVisible("Enormous Wool Car");
  });
}
