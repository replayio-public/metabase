import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;


test.describe("scenarios > visualizations > scalar", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
  });

  test("trend visualization should work regardless of column order (metabase#13710)", async ({ page }) => {
    cy.createQuestion(
      {
        name: "13710",
        query: {
          "source-table": ORDERS_ID,
          breakout: [
            ["field", ORDERS.QUANTITY, null],
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }],
          ],
        },
        display: "smartscalar",
      },
      { visitQuestion: true },
    );

    cy.log("Reported failing on v0.35 - v0.37.0.2");
    cy.log("Bug: showing blank visualization");

    await expect(page.locator(".ScalarValue")).toContainText("100");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(':text("Nothing to compare for the previous month.")')).toBeVisible();
  });
});

