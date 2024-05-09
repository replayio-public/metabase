import {
  restore,
  popover,
  modal,
  openOrdersTable,
  visualize,
  summarize,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > admin > datamodel > metrics", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.viewport(1400, 860);
  });

  test("should be possible to sort by metric (metabase#8283)", async ({ page }) => {
    // ... (rest of the test code)
  });

  test.describe("with no metrics", () => {
    test("should show no metrics in the list", async ({ page }) => {
      // ... (rest of the test code)
    });

    test("custom expression aggregation should work in metrics (metabase#22700)", async ({ page }) => {
      // ... (rest of the test code)
    });
  });

  test.describe("with metrics", () => {
    test.beforeEach(async () => {
      // ... (rest of the test code)
    });

    test("should show the metric detail view for a specific id", async ({ page }) => {
      // ... (rest of the test code)
    });

    test("should update that metric", async ({ page }) => {
      // ... (rest of the test code)
    });
  });

  test.describe("custom metrics", () => {
    test("should save the metric using custom expressions (metabase#13022)", async ({ page }) => {
      // ... (rest of the test code)
    });

    test("should show CE that uses 'AND/OR' (metabase#13069, metabase#13070)", async ({ page }) => {
      // ... (rest of the test code)
    });
  });
});

// Ugly hack to prevent failures that started after https://github.com/metabase/metabase/pull/24682 has been merged.
// For unknon reasons, popover doesn't open with expanded list of all Sample Database tables. Rather. it shows
// Sample Database (collapsed) only. We need to click on it to expand it.
// This conditional mechanism prevents failures even if that popover opens expanded in the future.
async function selectTable(tableName, page) {
  await page.locator("text=Select a table").click();

  const listSection = await page.locator(".List-section");
  if ((await listSection.count()) !== 5) {
    await page.locator("text=Sample Database").click();
  }
  await page.locator(`text=${tableName}`).click();
}
