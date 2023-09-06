import { restore, filterWidget, visitDashboard } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PEOPLE } = SAMPLE_DATABASE;

const questionDetails = {
  query: {
    "source-table": ORDERS_ID,
  },
};

const filter = {
  name: "Location",
  slug: "location",
  id: "96917420",
  type: "string/=",
  sectionId: "location",
};

const dashboardDetails = {
  parameters: [filter],
};


test.describe("issue 17211", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin();

    const { id, card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails, dashboardDetails });

    await page.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 8,
          size_y: 6,
          series: [],
          visualization_settings: {},
          parameter_mappings: [
            {
              parameter_id: filter.id,
              card_id,
              target: [
                "dimension",
                [
                  "field",
                  PEOPLE.CITY,
                  {
                    "source-field": ORDERS.USER_ID,
                  },
                ],
              ],
            },
          ],
        },
      ],
    });

    visitDashboard(dashboard_id);
  });

  test("should not falsely alert that no matching dashboard filter has been found (metabase#17211)", async ({ page }) => {
    await filterWidget().click();

    await page.locator('input[placeholder="Search by City"]').fill("abb");
    await page.locator('text=Abbeville').click();

    await expect(page.locator('text=No matching City found')).not.toBeVisible();
  });
});

