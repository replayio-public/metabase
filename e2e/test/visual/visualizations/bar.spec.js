import {
  restore,
  visitQuestionAdhoc,
  ensureDcChartVisibility,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";


test.describe("visual tests > visualizations > bar", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test("with stacked series", async () => {
    const testQuery = {
      type: "native",
      native: {
        query:
          "SELECT X, A, B, C " +
          "FROM (VALUES (1,20,30,30),(2,10,-40,-20),(3,20,10,30)) T (X, A, B, C)",
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "bar",
      visualization_settings: {
        "graph.dimensions": ["X"],
        "graph.metrics": ["A", "B", "C"],
        "stackable.stack_type": "stacked",
      },
    });

    ensureDcChartVisibility();
    cy.createPercySnapshot();
  });

  test("with an invalid SQL query and a long error message", async () => {
    const testQuery = {
      type: "native",
      native: {
        query: Array(50)
          .fill("SELECT A, B, C FROM EXAMPLE")
          .join(" UNION ALL\n"),
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "bar",
      visualization_settings: {
        "graph.dimensions": ["X"],
        "graph.metrics": ["A", "B", "C"],
        "stackable.stack_type": "stacked",
      },
    });

    cy.createPercySnapshot();
  });
});

