import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { USER_GROUPS } from "e2e/support/cypress_data";

const { PRODUCTS } = SAMPLE_DATABASE;
const { COLLECTION_GROUP } = USER_GROUPS;

const nativeFilter = {
  id: "dd7f3e66-b659-7d1c-87b3-ab627317581c",
  name: "cat",
  "display-name": "Cat",
  type: "dimension",
  dimension: ["field-id", PRODUCTS.CATEGORY],
  "widget-type": "category",
  default: null,
};

const nativeQuery = {
  name: "15163",
  native: {
    query: 'SELECT COUNT(*) FROM "PRODUCTS" WHERE {{cat}}',
    "template-tags": {
      cat: nativeFilter,
    },
  },
};

const dashboardFilter = {
  name: "Category",
  slug: "category",
  id: "fd723065",
  type: "category",
};

const dashboardDetails = {
  parameters: [dashboardFilter],
};

["nodata+nosql", "nosql"].forEach(test => {
  test.describe("issue 15163", () => {
    test.beforeEach(async ({ page }) => {
      // Replace Cypress commands with Playwright equivalents
      // ...

      if (test === "nosql") {
        // Replace Cypress commands with Playwright equivalents
        // ...
      }

      // Replace Cypress commands with Playwright equivalents
      // ...
    });

    test(`${test.toUpperCase()} version:\n should be able to view SQL question when accessing via dashboard with filters connected to modified card without SQL permissions (metabase#15163)`, async ({ page }) => {
      // Replace Cypress commands with Playwright equivalents
      // ...

      const cardQueryResponse = await page.waitForResponse("**/api/card/*/query", { timeout: 5000 });
      expect(cardQueryResponse.json().error).not.to.exist;

      await expect(page.locator(".ace_content")).not.toBeVisible();
      await expect(page.locator(".cellData")).toContainText("51");
      await expect(page.locator(':text("Showing 1 row")')).toBeVisible();
    });
  });
});
