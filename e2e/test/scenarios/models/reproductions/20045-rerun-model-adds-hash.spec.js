import { restore } from "e2e/support/helpers";


test.describe("issue 20045", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    cy.request("PUT", "/api/card/1", { name: "Orders Model", dataset: true });
  });

  test("should not add query hash on the rerun (metabase#20045)", async ({ page, context }) => {
    await page.goto("/model/1");

    await context.waitFor("@dataset");

    expect(await page.url()).toContain("/model/1-orders-model");
    expect(await page.url()).not.toContain("#");

    await page.locator('[data-testid="qb-header-action-panel"]').locator('.Icon-refresh').click();

    await context.waitFor("@dataset");

    expect(await page.url()).toContain("/model/1-orders-model");
    expect(await page.url()).not.toContain("#");
  });
});

