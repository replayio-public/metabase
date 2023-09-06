import { restore, visitDashboard } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > visualizations > gauge chart", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should not rerender on gauge arc hover (metabase#15980)", async ({ page }) => {
    const questionDetails = {
      name: "15980",
      query: { "source-table": ORDERS_ID, aggregation: [["count"]] },
      display: "gauge",
    };

    const { id, card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails });

    // Make dashboard card really small (necessary for this repro as it doesn't show any labels)
    await page.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 4,
          size_y: 4,
          parameter_mappings: [],
        },
      ],
    });

    visitDashboard(dashboard_id);

    await page.locator('[data-testid="gauge-arc-1"]').dispatchEvent("mousemove");
    await expect(page.locator(':text("Something went wrong")')).not.toBeVisible();
  });
});

