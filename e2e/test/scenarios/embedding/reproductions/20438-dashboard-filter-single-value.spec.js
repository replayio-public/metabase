import {
  restore,
  filterWidget,
  popover,
  visitDashboard,
  visitIframe,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "20438",
  native: {
    query:
      "SELECT * FROM PRODUCTS\nWHERE true\n    [[AND {{CATEGORY}}]]\n limit 30",
    "template-tags": {
      CATEGORY: {
        id: "24f69111-29f8-135f-9321-1ff94bbb31ad",
        name: "CATEGORY",
        "display-name": "Category",
        type: "dimension",
        dimension: ["field", PRODUCTS.CATEGORY, null],
        "widget-type": "string/=",
        default: null,
      },
    },
  },
};

const filter = {
  name: "Text",
  slug: "text",
  id: "b555d25b",
  type: "string/=",
  sectionId: "string",
};

const dashboardDetails = {
  parameters: [filter],
};


test.describe("issue 20438", () => {
  test.beforeEach(async ({ page }) => {
    // Replace Cypress commands with Playwright equivalents
    // ...
    // visitDashboard(dashboard_id);
  });

  test("dashboard filter connected to the field filter should work with a single value in embedded dashboards (metabase#20438)", async ({ page }) => {
    await page.locator('.Icon[name="share"]').click();
    await page.locator(':text("Embed in your application")').click();

    visitIframe();

    // Replace Cypress commands with Playwright equivalents
    // ...

    filterWidget().click();
    // Replace Cypress commands with Playwright equivalents
    // ...

    await page.locator(':text("Doohickey")').click();
    // Replace Cypress commands with Playwright equivalents
    // ...

    await page.locator(':text("Add filter")').click();
    // Replace Cypress commands with Playwright equivalents
    // ...

    await expect(page.locator('[data-testid="cell-data"]')).toHaveText(/Small Marble Shoes/);
    await expect(page.locator('[data-testid="cell-data"]')).not.toHaveText(/Rustic Paper Wallet/);
  });
});

