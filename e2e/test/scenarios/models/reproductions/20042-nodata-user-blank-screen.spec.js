import { restore } from "e2e/support/helpers";


test.describe("issue 20042", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/card/1/query").as("query");

    restore();
    cy.signInAsAdmin();

    cy.request("PUT", "/api/card/1", { name: "Orders Model", dataset: true });

    cy.signIn("nodata");
  });

  test("nodata user should not see the blank screen when visiting model (metabase#20042)", async ({ page, context }) => {
    await page.goto("/model/1");

    await context.waitFor("@query");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Orders Model");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=37.65");
  });
});
