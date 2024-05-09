import {
  restore,
  showDashboardCardActions,
  filterWidget,
  saveDashboard,
  editDashboard,
  visualize,
  visitDashboard,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { setAdHocFilter } from "../../native-filters/helpers/e2e-date-filter-helpers";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "17514",
  query: {
    "source-table": ORDERS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field", ORDERS.PRODUCT_ID, null],
          ["field", PRODUCTS.ID, { "join-alias": "Products" }],
        ],
        alias: "Products",
      },
    ],
  },
};

const filter = {
  name: "Date Filter",
  slug: "date_filter",
  id: "23ccbbf",
  type: "date/all-options",
  sectionId: "date",
};

const dashboardDetails = { parameters: [filter] };

test.describe("issue 17514", () => {
  test.beforeEach(async ({ restore, signInAsAdmin, page }) => {
    await restore();
    await signInAsAdmin();
    await page.route("POST", "/api/dataset");
  });

  test.describe("scenario 1", () => {
    test.beforeEach(async ({ createQuestionAndDashboard, editDashboardCard, visitDashboard, page }) => {
      const { card_id, dashboard_id } = await createQuestionAndDashboard({
        questionDetails,
        dashboardDetails,
      });

      await page.route(
        "POST",
        `/api/dashboard/${dashboard_id}/dashcard/*/card/${card_id}/query`,
      );

      const mapFilterToCard = {
        parameter_mappings: [
          {
            parameter_id: filter.id,
            card_id,
            target: ["dimension", ["field", ORDERS.CREATED_AT, null]],
          },
        ],
      };

      await editDashboardCard(card, mapFilterToCard);

      await visitDashboard(dashboard_id);

      await page.waitForResponse("@cardQuery");
      await page.locator("text=110.93").isVisible();
    });

    test("should not show the run overlay when we apply dashboard filter on a question with removed column and then click through its title (metabase#17514-1)", async ({ editDashboard, openVisualizationOptions, hideColumn, closeModal, saveDashboard, filterWidget, setAdHocFilter, page }) => {
      await editDashboard();

      await openVisualizationOptions();

      await hideColumn("Products → Ean");

      await closeModal();

      await saveDashboard();

      await filterWidget().click();
      await setAdHocFilter({ timeBucket: "years" });

      await page.locator("search").should("eq", "?date_filter=past30years");
      await page.waitForResponse("@cardQuery");

      await page.locator("text=Previous 30 Years");

      await page.locator("text=17514").click();
      await page.waitForResponse("@dataset");
      await page.locator("text=Subtotal");

      await page.locator("text=110.93").click();
      await page.locator("text=Filter by this value");
    });
  });

  test.describe("scenario 2", () => {
    test.beforeEach(async ({ createQuestion, openNotebookMode, removeJoinedTable, visualize, page }) => {
      await createQuestion(questionDetails, { visitQuestion: true });

      await page.locator('[data-testid="viz-settings-button"]').click();

      await moveColumnToTop("Subtotal");

      await openNotebookMode();

      await removeJoinedTable();

      await visualize();
      await page.locator("text=Subtotal").isVisible();

      await page.locator("text=Save").click();

      await page.locator(".Modal").within(() => {
        page.locator("button:text('Save')").click();
      });
    });

    test("should not show the run overlay because of the references to the orphaned fields (metabase#17514-2)", async ({ openNotebookMode, visualize, page }) => {
      await openNotebookMode();

      await page.locator("text=Join data").click();
      await page.locator("text=Products").click();

      await visualize();

      await page.locator("text=Subtotal").click();
      await page.locator("text=Filter by this column");
    });
  });
});

async function openVisualizationOptions() {
  await showDashboardCardActions();
  await page.locator("icon:palette").click({ force: true });
}

async function hideColumn(columnName) {
  await page.locator('[data-testid="chartsettings-sidebar"]').within(() => {
    page.locator(`text=${columnName}`).sibling("[data-testid$=hide-button]").click();
  });
}

async function closeModal() {
  await page.locator(".Modal").within(() => {
    page.locator("button:text('Done')").click();
  });
}

async function openNotebookMode() {
  await page.locator("icon:notebook").click();
}

async function removeJoinedTable() {
  await page.locator("text=Join data")
    .first()
    .parent()
    .locator("label:text('Remove step')")
    .click({ force: true });
}

async function moveColumnToTop(column) {
  await page.locator('[data-testid="sidebar-left"]').within(() => {
    page.locator(`text=${column}`)
      .should("be.visible")
      .closest("[data-testid^=draggable-item]")
      .trigger("mousedown", 0, 0, { force: true })
      .trigger("mousemove", 5, 5, { force: true })
      .trigger("mousemove", 0, -600, { force: true })
      .trigger("mouseup", 0, -600, { force: true });
  });
}
