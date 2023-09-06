import {
  restore,
  downloadAndAssert,
  startNewQuestion,
  visualize,
  visitDashboard,
  popover,
  assertSheetRowsCount,
  filterWidget,
  saveDashboard,
  getDashboardCardMenu,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const testCases = ["csv", "xlsx"];

const canSavePngQuestion = {
  name: "Q1",
  display: "line",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  visualization_settings: {
    "graph.metrics": ["count"],
    "graph.dimensions": ["CREATED_AT"],
  },
};

const cannotSavePngQuestion = {
  name: "Q2",
  display: "table",
  query: {
    "source-table": ORDERS_ID,
  },
  visualization_settings: {},
};

test.describe("scenarios > question > download", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  testCases.forEach(fileType => {
    test(`downloads ${fileType} file`, async () => {
      startNewQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Saved Questions").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Orders, Count").click();

      visualize();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=18,760")).toBeVisible();

      downloadAndAssert({ fileType }, sheet => {
        expect(sheet["A1"].v).to.eq("Count");
        expect(sheet["A2"].v).to.eq(18760);
      });
    });
  });

  test.describe("from dashboards", () => {
    test("should allow downloading card data", async () => {
      cy.intercept("GET", "/api/dashboard/**").as("dashboard");
      visitDashboard(1);
      await page.locator('[data-testid="dashcard"]').within(() => {
        page.locator('[data-testid="legend-caption"]').realHover();
      });

      assertOrdersExport(18760);

      await page.locator("icon=pencil").click();

      await page.locator("icon=filter").click();

      popover().within(() => {
        page.locator("text=ID").click();
      });

      await page.locator(".DashCard").locator("text=Select…").click();
      popover().locator("text=ID").eq(0).click();

      saveDashboard();

      filterWidget().locator("text=ID").click();

      popover().locator("input").fill("1");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Add filter").click();

      await page.waitForResponse("@dashboard");

      await page.locator('[data-testid="dashcard"]').within(() => {
        page.locator('[data-testid="legend-caption"]').realHover();
      });

      assertOrdersExport(1);
    });
  });

  test.describe("png images", () => {
    test("from dashboards", async () => {
      cy.createDashboardWithQuestions({
        dashboardName: "saving pngs dashboard",
        questions: [canSavePngQuestion, cannotSavePngQuestion],
      }).then(({ dashboard }) => {
        visitDashboard(dashboard.id);
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Q1").realHover();
      getDashboardCardMenu(0).click();

      popover().within(() => {
        page.locator("text=Download results").click();
        page.locator("text=.png").click();
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Q2").realHover();
      getDashboardCardMenu(1).click();

      popover().within(() => {
        page.locator("text=Download results").click();
        page.locator("text=.png").should("not.exist");
      });

      cy.verifyDownload(".png", { contains: true });
    });

    test("from query builder", async () => {
      cy.createQuestion(canSavePngQuestion, { visitQuestion: true });

      await page.locator('[data-testid="download-button"]').click();

      popover().within(() => {
        page.locator("text=.png").click();
      });

      cy.verifyDownload(".png", { contains: true });

      cy.createQuestion(cannotSavePngQuestion, { visitQuestion: true });

      await page.locator('[data-testid="download-button"]').click();

      popover().within(() => {
        page.locator("text=.png").should("not.exist");
      });
    });
  });
});

test.describe("scenarios > dashboard > download pdf", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });
  test.skip("should allow you to download a PDF of a dashboard", async () => {
    cy.createDashboardWithQuestions({
      dashboardName: "saving pdf dashboard",
      questions: [canSavePngQuestion, cannotSavePngQuestion],
    }).then(({ dashboard }) => {
      visitDashboard(dashboard.id);
    });

    await page.locator('[aria-label="dashboard-menu-button"]').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Export as PDF").click();

    cy.verifyDownload("saving pdf dashboard.pdf", { contains: true });
  });
});

function assertOrdersExport(length) {
  downloadAndAssert(
    {
      fileType: "xlsx",
      questionId: 1,
      dashcardId: 1,
      dashboardId: 1,
    },
    sheet => {
      expect(sheet["A1"].v).to.eq("ID");
      expect(sheet["A2"].v).to.eq(1);
      expect(sheet["B1"].v).to.eq("User ID");
      expect(sheet["B2"].v).to.eq(1);

      assertSheetRowsCount(length)(sheet);
    },
  );
}
