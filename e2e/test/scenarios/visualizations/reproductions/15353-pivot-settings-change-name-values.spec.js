import { restore, sidebar } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "15353",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }]],
  },
  display: "pivot",
};


test.describe("issue 15353", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset/pivot").as("pivotDataset");

    restore();
    cy.signInAsAdmin();

    cy.createQuestion(questionDetails, { visitQuestion: true });
  });

  test("should be able to change field name used for values (metabase#15353)", async ({ page, context }) => {
    await page.locator('[data-testid="viz-settings-button"]').click();
    sidebar()
      .contains("Count")
      .siblings("[data-testid$=settings-button]")
      .click();

    await page.locator('[aria-label="Display value"]').fill("Count renamed");
    await page.locator('[aria-label="Display value"]').blur();

    await context.waitFor("@pivotDataset");

    await expect(page.locator(".Visualization")).toContainText("Count renamed");
  });
});
