import { popover, restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "22788",
  dataset_query: {
    type: "query",
    database: SAMPLE_DB_ID,
    query: {
      "source-table": ORDERS_ID,
      filter: ["=", ["field", ORDERS.USER_ID, null], 1],
    },
  },
};


test.describe("issue 29082", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test('should handle nulls in quick filters (metabase#29082)', async ({ page }) => {
    visitQuestionAdhoc(questionDetails);
    await page.waitForResponse("/api/dataset");
    await expect(page.locator('text=Showing 11 rows')).toBeVisible();

    await page.locator(".TableInteractive-emptyCell").first().click();
    await popover().within(() => page.locator('text==').click());
    await page.waitForResponse("/api/dataset");
    await expect(page.locator('text=Showing 8 rows')).toBeVisible();
    await expect(page.locator('text=Discount is empty')).toBeVisible();

    await page.locator('text=Discount is empty').locator('.icon-close').click();
    await page.waitForResponse("/api/dataset");
    await expect(page.locator('text=Showing 11 rows')).toBeVisible();

    await page.locator(".TableInteractive-emptyCell").first().click();
    await popover().within(() => page.locator('text=≠').click());
    await page.waitForResponse("/api/dataset");
    await expect(page.locator('text=Showing 3 rows')).toBeVisible();
    await expect(page.locator('text=Discount is not empty')).toBeVisible();
  });
});

