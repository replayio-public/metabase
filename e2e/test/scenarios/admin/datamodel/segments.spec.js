// Ported from `segments.e2e.spec.js`
import { restore, popover, modal } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > admin > datamodel > segments", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();
    page.setViewportSize({ width: 1400, height: 860 });
  });

  test.describe("with no segments", () => {
    test('should show no segments in UI', async ({ page }) => {
      await page.goto("/admin/datamodel/segments");
      await page.click('text="Segments"');
      await page.waitForSelector('text="Create segments to add them to the Filter dropdown in the query builder"');
    });

    test("should have 'Custom expression' in a filter list (metabase#13069)", async ({ page }) => {
      await page.goto("/admin/datamodel/segments");
      await page.click('text="New segment"');
      await page.click('text="Select a table"');

      const listSection = await page.locator('.List-section');
      if ((await listSection.count()) !== 5) {
        await page.click('text="Sample Database"');
      }
      await page.click('text="Orders"');

      await page.click('text="Add filters to narrow your answer"');

      await expect(page.locator('text="Custom Expression"')).toBeVisible();
    });
  });

  test.describe("with segment", () => {
    const SEGMENT_NAME = "Orders < 100";

    test.beforeEach(async () => {
      // Create a segment through API
      cy.request("POST", "/api/segment", {
        name: SEGMENT_NAME,
        description: "All orders with a total under $100.",
        table_id: ORDERS_ID,
        definition: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          filter: ["<", ["field", ORDERS.TOTAL, null], 100],
        },
      });
    });

    test("should show up in UI list", async ({ page }) => {
      await page.goto("/admin/datamodel/segments");
      await page.waitForSelector('text=SEGMENT_NAME');
      await page.waitForSelector('text="Filtered by Total"');
    });

    test("should show the segment details of a specific id", async ({ page }) => {
      await page.goto("/admin/datamodel/segment/1");
      await page.waitForSelector('text="Edit Your Segment"');
      await page.waitForSelector('text="Preview"');
    });

    // Add the remaining tests for updating the segment, following the same pattern as the previous tests.
  });
});

