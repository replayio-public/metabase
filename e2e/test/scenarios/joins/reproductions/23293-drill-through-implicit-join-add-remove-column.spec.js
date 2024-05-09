import {
  restore,
  popover,
  openOrdersTable,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, PRODUCTS } = SAMPLE_DATABASE;

test.describe("issue 23293", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test('should retain the filter when drilling through the dashboard card with implicitly added column (metabase#23293)', async ({ page }) => {
    openOrdersTable();

    await page.locator('[data-testid="viz-settings-button"]').click();
    await modifyColumn("Product ID", "remove");
    await modifyColumn("Category", "add");
    await page.waitForResponse("@dataset");

    const questionId = await saveQuestion(page);

    const questionDetails = {
      query: {
        "source-table": `card__${questionId}`,
        aggregation: [["count"]],
        breakout: [
          [
            "field",
            PRODUCTS.CATEGORY,
            {
              "source-field": ORDERS.PRODUCT_ID,
            },
          ],
        ],
      },
      display: "bar",
    };

    const dashboard_id = await createQuestionAndDashboard({ questionDetails });

    visitDashboard(dashboard_id);

    await page.locator('.bar').first().click();
    await popover()
      .findByText(/^See these/)
      .click();

    await page.locator('[data-testid="qb-filters-panel"]').should(
      "contain",
      "Product → Category is Doohickey",
    );
    await page.locator('[data-testid="header-cell"]')
      .last()
      .should("have.text", "Product → Category");

    await page.locator('@tableResults')
      .should("contain", "Doohickey")
      .and("not.contain", "Gizmo");
  });
});

/**
 * @param {string} columnName
 * @param {("add"|"remove")} action
 */
async function modifyColumn(columnName, action) {
  const icon = action === "add" ? "add" : "eye_outline";
  const iconSelector = `.Icon-${icon}`;
  const columnSeletor = `draggable-item-${columnName}`;
  await page.locator(`[data-testid="${columnSeletor}"]`).locator(iconSelector).click();
}

async function saveQuestion(page) {
  await page.route("POST", "/api/card").as("saveQuestion");

  await page.locator('[data-testid="qb-header-action-panel"]').locator('text=Save').click();
  await page.locator('.Modal').locator('text=Save').click();
  await page.locator('.Modal').locator('text=Not now').click();

  const saveQuestionResponse = await page.waitForResponse("@saveQuestion");
  const { id } = await saveQuestionResponse.json();
  return id;
}
