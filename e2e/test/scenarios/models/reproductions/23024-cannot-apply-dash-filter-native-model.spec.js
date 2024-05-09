import {
  addOrUpdateDashboardCard,
  editDashboard,
  popover,
  restore,
  visitDashboard,
  setModelMetadata,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;


test.describe("issue 23024", () => {
  test.beforeEach(async ({ restore, signInAsAdmin, createNativeQuestion, setModelMetadata }) => {
    await restore();
    await signInAsAdmin();

    const modelId = await createNativeQuestion(
      {
        native: {
          query: `select * from products limit 5`,
        },
        dataset: true,
      },
      { wrapId: true, idAlias: "modelId" },
    );

    await setModelMetadata(modelId, field => {
      if (field.display_name === "CATEGORY") {
        return {
          ...field,
          id: PRODUCTS.CATEGORY,
          display_name: "Category",
          semantic_type: "type/Category",
        };
      }

      return field;
    });

    addModelToDashboardAndVisit();
  });

  test('should be possible to apply the dashboard filter to the native model (metabase#23024)', async ({ editDashboard, popover }) => {
    await editDashboard();

    await page.locator('i.icon-filter').click();

    await page.locator('Text or Category').click();
    await page.locator('Is').click();

    await page.locator('Column to filter on').parent().within(() => {
      page.locator('Select…').click();
    });

    await popover().contains("Category");
  });
});



async function addModelToDashboardAndVisit() {
  const dashboardId = await cy.createDashboard();
  const cardId = await cy.get("@modelId");
  await addOrUpdateDashboardCard({
    dashboard_id: dashboardId,
    card_id: cardId,
  });

  visitDashboard(dashboardId);
}

