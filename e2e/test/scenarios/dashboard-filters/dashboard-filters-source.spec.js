import {
  editDashboard,
  popover,
  restore,
  saveDashboard,
  setFilter,
  visitDashboard,
  openQuestionActions,
  visitQuestion,
  setFilterQuestionSource,
  setFilterListSource,
  visitEmbeddedPage,
  visitPublicDashboard,
  describeEE,
  setSearchBoxFilterType,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const structuredSourceQuestion = {
  name: "GUI source",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
    breakout: [["field", PRODUCTS.CATEGORY, null]],
    filter: ["!=", ["field", PRODUCTS.CATEGORY, null], "Doohickey"],
  },
};

const nativeSourceQuestion = {
  name: "SQL source",
  native: {
    query: "select CATEGORY from PRODUCTS WHERE CATEGORY != 'Doohickey'",
  },
};

const targetParameter = {
  id: "f8ec7c71",
  type: "string/=",
  name: "Text",
  slug: "text",
  sectionId: "string",
};

const targetQuestion = {
  display: "scalar",
  query: {
    "source-table": PRODUCTS_ID,
    aggregation: [["count"]],
  },
};

test.describe("scenarios > dashboard > filters", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test.describe("structured question source", () => {
    test('should be able to use a structured question source', async () => {
      cy.createQuestion(structuredSourceQuestion, { wrapId: true });
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
      }).then(({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      });

      editDashboard();
      setFilter("Text or Category", "Is");
      mapFilterToQuestion();
      setFilterQuestionSource({ question: "GUI source", field: "Category" });
      saveDashboard();
      filterDashboard();

      cy.get("@questionId").then(visitQuestion);
      archiveQuestion();
    });

    test('should be able to use a structured question source without mapping to a field', async () => {
      cy.createQuestion(structuredSourceQuestion);
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
      }).then(({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      });

      editDashboard();
      setFilter("Text or Category", "Is");
      setFilterQuestionSource({ question: "GUI source", field: "Category" });
      saveDashboard();
      filterDashboard();
    });

    test('should be able to use a structured question source when embedded', async () => {
      cy.createQuestion(structuredSourceQuestion).then(
        ({ body: { id: questionId } }) => {
          cy.createQuestionAndDashboard({
            questionDetails: targetQuestion,
            dashboardDetails: getStructuredDashboard(questionId),
          }).then(({ body: card }) => {
            cy.editDashboardCard(card, getParameterMapping(card));
            visitEmbeddedPage(getDashboardResource(card));
          });
        },
      );

      filterDashboard();
    });

    test('should be able to use a structured question source when public', async () => {
      cy.createQuestion(structuredSourceQuestion).then(
        ({ body: { id: questionId } }) => {
          cy.createQuestionAndDashboard({
            questionDetails: targetQuestion,
            dashboardDetails: getStructuredDashboard(questionId),
          }).then(({ body: card }) => {
            cy.editDashboardCard(card, getParameterMapping(card));
            visitPublicDashboard(card.dashboard_id);
          });
        },
      );

      filterDashboard();
    });
  });

  test.describe("native question source", () => {
    test('should be able to use a native question source', async () => {
      cy.createNativeQuestion(nativeSourceQuestion, { wrapId: true });
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
      }).then(({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      });

      editDashboard();
      setFilter("Text or Category", "Is");
      mapFilterToQuestion();
      setFilterQuestionSource({ question: "SQL source", field: "CATEGORY" });
      saveDashboard();
      filterDashboard();

      cy.get("@questionId").then(visitQuestion);
      archiveQuestion();
    });

    test('should be able to use a native question source when embedded', async () => {
      cy.createNativeQuestion(nativeSourceQuestion).then(
        ({ body: { id: questionId } }) => {
          cy.createQuestionAndDashboard({
            questionDetails: targetQuestion,
            dashboardDetails: getNativeDashboard(questionId),
          }).then(({ body: card }) => {
            cy.editDashboardCard(card, getParameterMapping(card));
            visitEmbeddedPage(getDashboardResource(card));
          });
        },
      );

      filterDashboard();
    });

    test('should be able to use a native question source when public', async () => {
      cy.createNativeQuestion(nativeSourceQuestion).then(
        ({ body: { id: questionId } }) => {
          cy.createQuestionAndDashboard({
            questionDetails: targetQuestion,
            dashboardDetails: getNativeDashboard(questionId),
          }).then(({ body: card }) => {
            cy.editDashboardCard(card, getParameterMapping(card));
            visitPublicDashboard(card.dashboard_id);
          });
        },
      );

      filterDashboard();
    });
  });

  test.describe("static list source", () => {
    test('should be able to use a static list source', async () => {
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
      }).then(({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      });

      editDashboard();
      setFilter("Text or Category", "Is");
      mapFilterToQuestion();
      setFilterListSource({ values: ["Gadget", "Gizmo", "Widget"] });
      saveDashboard();
      filterDashboard();
    });

    test('should be able to use a static list source when embedded', async () => {
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
        dashboardDetails: getListDashboard(),
      }).then(({ body: card }) => {
        cy.editDashboardCard(card, getParameterMapping(card));
        visitEmbeddedPage(getDashboardResource(card));
      });

      filterDashboard();
    });

    test('should be able to use a static list source when public', async () => {
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
        dashboardDetails: getListDashboard(),
      }).then(({ body: card }) => {
        cy.editDashboardCard(card, getParameterMapping(card));
        visitPublicDashboard(card.dashboard_id);
      });

      filterDashboard();
    });
  });

  test.describe("field source", () => {
    test('should be able to use search box with fields configured for list', async () => {
      cy.createQuestionAndDashboard({
        questionDetails: targetQuestion,
      }).then(({ body: { dashboard_id } }) => {
        visitDashboard(dashboard_id);
      });

      editDashboard();
      setFilter("Text or Category", "Is");
      mapFilterToQuestion();
      setSearchBoxFilterType();
      saveDashboard();
      filterDashboard({ isField: true });
    });
  });
});

describeEE("scenarios > dashboard > filters", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should sandbox parameter values in dashboards', async () => {
    cy.sandboxTable({
      table_id: PRODUCTS_ID,
      attribute_remappings: {
        attr_uid: ["dimension", ["field", PRODUCTS.ID, null]],
      },
    });

    cy.createQuestion(structuredSourceQuestion).then(
      ({ body: { id: questionId } }) => {
        cy.createQuestionAndDashboard({
          questionDetails: targetQuestion,
          dashboardDetails: getStructuredDashboard(questionId),
        }).then(({ body: card }) => {
          cy.editDashboardCard(card, getParameterMapping(card));
          cy.signOut();
          cy.signInAsSandboxedUser();
          visitDashboard(card.dashboard_id);
        });
      },
    );

    filterDashboard({ isSandboxed: true });
  });
});

const mapFilterToQuestion = () => {
  cy.findByText("Select…").click();
  popover().within(() => cy.findByText("Category").click());
};

const filterDashboard = ({ isField = false, isSandboxed = false } = {}) => {
  cy.findByText("Text").click();

  popover().within(() => {
    cy.findByText("Gizmo").should("be.visible");
    cy.findByText("Doohickey").should(isField ? "be.visible" : "not.exist");
    cy.findByText("Gadget").should(isSandboxed ? "not.exist" : "be.visible");
    cy.findByText("Widget").should(isSandboxed ? "not.exist" : "be.visible");

    cy.findByPlaceholderText("Search the list").type("i");
    cy.findByText("Gadget").should("not.exist");
    cy.findByText("Widget").should(isSandboxed ? "not.exist" : "be.visible");
    cy.findByText("Doohickey").should(isField ? "be.visible" : "not.exist");

    cy.findByText("Gizmo").click();
    cy.button("Add filter").click();
  });
};

const archiveQuestion = () => {
  openQuestionActions();
  cy.findByTestId("archive-button").click();
  cy.findByText(
    "This question will be removed from any dashboards or pulses using it. It will also be removed from the filter that uses it to populate values.",
  );
};

const getDashboardResource = ({ dashboard_id }) => ({
  resource: { dashboard: dashboard_id },
  params: {},
});

const getTargetDashboard = sourceSettings => ({
  parameters: [
    {
      ...targetParameter,
      ...sourceSettings,
    },
  ],
  enable_embedding: true,
  embedding_params: {
    [targetParameter.slug]: "enabled",
  },
});

const getStructuredDashboard = questionId => {
  return getTargetDashboard({
    values_source_type: "card",
    values_source_config: {
      card_id: questionId,
      value_field: ["field", PRODUCTS.CATEGORY, null],
    },
  });
};

const getNativeDashboard = questionId => {
  return getTargetDashboard({
    values_source_type: "card",
    values_source_config: {
      card_id: questionId,
      value_field: ["field", "CATEGORY", { "base-type": "type/Text" }],
    },
  });
};

const getListDashboard = () => {
  return getTargetDashboard({
    values_source_type: "static-list",
    values_source_config: {
      values: ["Gadget", "Gizmo", "Widget"],
    },
  });
};

const getParameterMapping = ({ card_id }) => ({
  parameter_mappings: [
    {
      card_id,
      parameter_id: targetParameter.id,
      target: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
    },
  ],
});
