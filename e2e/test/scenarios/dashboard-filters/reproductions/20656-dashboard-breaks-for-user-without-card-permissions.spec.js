import {
  restore,
  filterWidget,
  visitDashboard,
  editDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const filter = {
  name: "ID",
  slug: "id",
  id: "11d79abe",
  type: "id",
  sectionId: "id",
};

const questionDetails = {
  query: { "source-table": PRODUCTS_ID, limit: 2 },
  // Admin's personal collection is always the first one (hence, the id 1)
  collection_id: 1,
};

const dashboardDetails = {
  parameters: [filter],
};


test.describe("issue 20656", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should allow a user to visit a dashboard even without a permission to see the dashboard card (metabase#20656, metabase#24536)", async ({ page }) => {
    const { id, card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails, dashboardDetails });

    await page.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 18,
          size_y: 10,
          parameter_mappings: [
            {
              parameter_id: filter.id,
              card_id,
              target: ["dimension", ["field", PRODUCTS.ID, null]],
            },
          ],
        },
      ],
    });

    await signInAsNormalUser(page);

    visitDashboard(dashboard_id);

    // Make sure the filter widget is there
    filterWidget();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Sorry, you don't have permission to see this card.")).toBeVisible();

    // Trying to edit the filter should not show mapping fields and shouldn't break frontend (metabase#24536)
    editDashboard();

    await page.locator('[data-testid="edit-dashboard-parameters-widget-container"] .Icon-gear').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Column to filter on").locator('..')).toContainElement('.Icon-key');
  });
});

