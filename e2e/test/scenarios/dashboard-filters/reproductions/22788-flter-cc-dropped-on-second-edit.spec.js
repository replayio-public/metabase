import {
  restore,
  visitDashboard,
  filterWidget,
  editDashboard,
  saveDashboard,
  sidebar,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;

const ccName = "Custom Category";
const ccDisplayName = "Product.Custom Category";

const questionDetails = {
  name: "22788",
  query: {
    "source-table": PRODUCTS_ID,
    expressions: { [ccName]: ["field", PRODUCTS.CATEGORY, null] },
    limit: 5,
  },
};

const filter = {
  name: "Text",
  slug: "text",
  id: "a7565817",
  type: "string/=",
  sectionId: "string",
};

const dashboardDetails = {
  name: "22788D",
  parameters: [filter],
};


test.describe("issue 22788", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await signInAsAdmin();

    const { dashboard_id, card_id, id } = await createQuestionAndDashboard({ questionDetails, dashboardDetails });

    await request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 8,
          size_y: 6,
          parameter_mappings: [
            {
              parameter_id: filter.id,
              card_id,
              target: ["dimension", ["expression", ccName, null]],
            },
          ],
        },
      ],
    });

    visitDashboard(dashboard_id);
  });

  test('should not drop filter connected to a custom column on a second dashboard edit (metabase#22788)', async ({ page }) => {
    await addFilterAndAssert(page);

    await editDashboard(page);

    await openFilterSettings(page);

    // Make sure the filter is still connected to the custom column
    await expect(page.locator('text=Column to filter on').elementHandle().parent()).toContainText(ccDisplayName);

    // need to actually change the dashboard to test a real save
    await sidebar().within(() => {
      await page.locator('input[displayvalue="Text"]').fill('my filter text');
      await page.locator('button:text("Done")').click();
    });

    await saveDashboard(page);

    await addFilterAndAssert(page);
  });
});



async function addFilterAndAssert(page) {
  await filterWidget().click();
  await page.locator('input[placeholder="Enter some text"]').fill('Gizmo');
  await page.locator('input[placeholder="Enter some text"]').press('Enter');
  await page.locator('button:text("Add filter")').click();

  await expect(page.locator('text=Gizmo')).toBeVisible();
  await expect(page.locator('text=Doohickey')).not.toBeVisible();
}



async function openFilterSettings(page) {
  await page.locator('[data-testid="edit-dashboard-parameters-widget-container"] .Icon-gear').click();
}

