import { restore, modal } from "e2e/support/helpers";

const MONGO_DB_NAME = "QA Mongo4";


test.describe("scenarios > question > native > mongo", { tags: "@external" }, () => {
  test.beforeEach(async ({ context }) => {
    context.interceptCreateQuestion = test.intercept("POST", "/api/card");
    context.interceptDataset = test.intercept("POST", "/api/dataset");

    restore("mongo-4");
    cy.signInAsNormalUser();

    cy.visit("/");
    cy.findByText("New").click();
    cy.findByText("Native query").click();
    cy.findByText(MONGO_DB_NAME).click();

    cy.findByText("Select a table").click();
    cy.findByText("Orders").click();
  });

  test("can save a native MongoDB query", async ({ page, context }) => {
    await page.locator(".ace_content")
      .type(`[ { $count: "Total" } ]`, {
        parseSpecialCharSequences: false,
      });
    await page.locator(".NativeQueryEditor .Icon-play").click();

    await test.expect(context.interceptDataset).eventually.toBeCalled();

    await page.locator("text=18,760").isVisible();

    await page.locator("text=Save").click();

    await page.locator("text=Save new question").isVisible();

    modal().within(() => {
      cy.findByLabelText("Name").clear().should("be.empty").type("mongo count");

      cy.button("Save").should("not.be.disabled").click();
    });

    await test.expect(context.interceptCreateQuestion).eventually.toBeCalled();

    await page.locator("text=Not now").click();

    await test.expect(page.url()).toMatch(/\/question\/\d+-[a-z0-9-]*$/);
  });
});

