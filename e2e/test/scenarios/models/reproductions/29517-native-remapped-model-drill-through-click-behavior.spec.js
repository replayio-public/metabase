import {
  restore,
  popover,
  visitQuestion,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const questionDetails = {
  name: "29517",
  dataset: true,
  native: {
    query:
      'Select Orders."ID" AS "ID",\nOrders."CREATED_AT" AS "CREATED_AT"\nFrom Orders',
    "template-tags": {},
  },
};

test.describe("issue 29517 - nested question based on native model with remapped values", () => {
  test.beforeEach(async ({ login, createNativeQuestion, createQuestionAndDashboard, editDashboardCard }) => {
    await restore();
    await login();

    const { id } = await createNativeQuestion(questionDetails);
    const schema = await intercept("GET", `/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`);
    await visit(`/model/${id}/metadata`);
    await schema.wait();

    mapModelColumnToDatabase({ table: "Orders", field: "ID" });
    selectModelColumn("CREATED_AT");
    mapModelColumnToDatabase({ table: "Orders", field: "Created At" });

    const updateModel = await intercept("PUT", `/api/card/*`);
    await button("Save changes").click();
    await updateModel.wait();

    const nestedQuestionDetails = {
      query: {
        "source-table": `card__${id}`,
        aggregation: [["count"]],
        breakout: [
          [
            "field",
            "CREATED_AT",
            { "temporal-unit": "month", "base-type": "type/DateTime" },
          ],
        ],
      },
      display: "line",
    };

    const { card_id, dashboard_id } = await createQuestionAndDashboard({
      questionDetails: nestedQuestionDetails,
    });

    await editDashboardCard(card, {
      visualization_settings: {
        click_behavior: {
          type: "link",
          linkType: "dashboard",
          targetId: 1, // Orders in a dashboard
          parameterMapping: {},
        },
      },
    });

    test.context.nestedQuestionId = card_id;
    test.context.dashboardId = dashboard_id;
  });

  test("drill-through should work (metabase#29517-1)", async ({ visitQuestion }) => {
    await visitQuestion(test.context.nestedQuestionId);

    const dataset = await intercept("POST", "/api/dataset");
    // We can click on any circle; this index was chosen randomly
    await page.locator("circle").nth(25).click({ force: true });
    await popover().findByText(/^See these/).click();
    await dataset.wait();

    await page.locator('[data-testid="qb-filters-panel"]').should(
      "contain",
      "Created At is May, 2018",
    );
    await page.locator('[data-testid="view-footer"]').should("contain", "Showing 520 rows");
  });

  test("click behavoir to custom destination should work (metabase#29517-2)", async ({ visitDashboard }) => {
    await visitDashboard(test.context.dashboardId);

    const loadTargetDashboard = await intercept("GET", "/api/dashboard/1");
    await page.locator("circle").nth(25).click({ force: true });
    await loadTargetDashboard.wait();

    await expect(page.locator("pathname")).toEqual("/dashboard/1");
    await page.locator(".cellData").contains("37.65");
  });
});

async function mapModelColumnToDatabase({ table, field }) {
  await page.locator('#formField-id').locator('[data-testid="select-button"]').click();
  await popover().findByRole("option", { name: table }).click();
  await popover().findByRole("option", { name: field }).click();
  await page.locator(`${table} → ${field}`).shouldBeVisible();
  await page.locator('[aria-label="Description"]').shouldNotBeEmpty();
}

async function selectModelColumn(column) {
  await page.locator('[data-testid="header-cell"]').contains(column).click();
}
