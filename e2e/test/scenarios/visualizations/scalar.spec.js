import {
  restore,
  visitQuestionAdhoc,
  visitDashboard,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > visualizations > scalar", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  const SCREEN_SIZES = {
    mobile: [600, 400],
    tablet: [900, 600],
    desktop: [1200, 800],
    hd: [1920, 1280],
  };

  Object.entries(SCREEN_SIZES).forEach(([size, viewport]) => {
    test(`should render human readable numbers on ${size} screen size (metabase`, async ({ page }) => {
      const [width, height] = viewport;

      if (size === "mobile") {
        test.skip();
      }

      await page.setViewportSize({ width, height });
      const dashboard_id = await createQuestionAndDashboard({
        questionDetails: {
          name: "12629",
          query: {
            "source-table": ORDERS_ID,
            aggregation: [
              ["*", 1000000, ["sum", ["field", ORDERS.TOTAL, null]]],
            ],
          },
          display: "scalar",
        },
        cardDetails: {
          size_x: 4,
          size_y: 4,
        },
      });
      visitDashboard(dashboard_id);
      await page.locator("text=1.5T");
    });
  });

  test(`should render date without time (metabase#7494)`, async ({ page }) => {
    visitQuestionAdhoc({
      dataset_query: {
        type: "native",
        native: {
          query: `SELECT cast('2018-05-01T00:00:00Z'::timestamp as date)`,
          "template-tags": {},
        },
        database: SAMPLE_DB_ID,
      },
      display: "scalar",
    });

    await page.locator("text=April 30, 2018");
    await page.locator("@viz-settings-button").click();

    await expect(page.locator("text=Show the time")).toBeHidden();
    await expect(page.locator("text=Time style")).toBeHidden();
  });
});

