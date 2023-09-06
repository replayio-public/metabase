import {
  editDashboard,
  getDashboardCard,
  getNotebookStep,
  modal,
  openNotebook,
  restore,
  saveDashboard,
  selectDashboardFilter,
  visitDashboard,
  visitQuestion,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  display: "table",
  query: {
    "source-query": {
      "source-table": PRODUCTS_ID,
      aggregation: [
        ["count"],
        ["sum", ["field", PRODUCTS.PRICE, null]],
        ["sum", ["field", PRODUCTS.RATING, null]],
      ],
      breakout: [["field", PRODUCTS.CATEGORY, null]],
    },
    fields: [
      ["field", PRODUCTS.CATEGORY, null],
      ["field", "sum", { "base-type": "type/Float" }],
      ["field", "sum_2", { "base-type": "type/Float" }],
      ["expression", "Custom Column"],
    ],
    expressions: {
      "Custom Column": ["+", 1, 1],
    },
  },
};

const filterDetails = {
  id: "b6f1865b",
  name: "Date filter",
  slug: "date",
  type: "date/month-year",
  sectionId: "date",
};

const dashboardDetails = {
  name: "Filters",
  parameters: [filterDetails],
};


test.describe("issue 19745", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("should unwrap the nested query when removing the last expression (metabase#19745)", async () => {
    updateQuestionAndSelectFilter(() => removeExpression("Custom Column"));
  });

  test("should unwrap the nested query when removing all expressions (metabase#19745)", async () => {
    updateQuestionAndSelectFilter(() => removeAllExpressions());
  });
});



async function updateQuestionAndSelectFilter(updateExpressions) {
  const { card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails, dashboardDetails });

  visitQuestion(card_id);

  // this should modify the query and remove the second stage
  openNotebook();
  updateExpressions();
  updateQuestion();

  // as we select all columns in the first stage of the query,
  // it should be possible to map a filter to a selected column
  visitDashboard(dashboard_id);
  editDashboard();
  await page.click('text="Date filter"');
  selectDashboardFilter(getDashboardCard(), "Created At");
  saveDashboard();
}



async function removeExpression(name) {
  await page.locator(getNotebookStep("expression", { stage: 1 })).within(async () => {
    await page.locator(`text="${name}"`).within(async () => {
      await page.locator('icon="close"').click();
    });
  });
}



async function removeAllExpressions() {
  await page.locator(getNotebookStep("expression", { stage: 1 })).within(async () => {
    await page.locator('label="Remove step"').click({ force: true });
  });
}



async function updateQuestion() {
  await page.route("PUT", "/api/card/*", { alias: "updateQuestion" });
  await page.click('text="Save"');
  modal().button("Save").click();
  await page.waitForResponse("@updateQuestion");
}

