import { modal, popover, restore } from "e2e/support/helpers";


test.describe("issue 25144", () => {
  test.beforeEach(async ({ page }) => {
    restore("setup");
    cy.signInAsAdmin();
    cy.intercept("POST", `/api/card`).as("createCard");
    cy.intercept("PUT", `/api/card/*`).as("updateCard");
  });

  test("should show Saved Questions section after creating the first question (metabase#25144)", async ({ page }) => {
    await page.goto("/");

    await page.locator('text="New"').click();
    popover().findByText("Question").click();
    popover().findByText("Orders").click();
    await page.locator('text="Save"').click();
    modal().findByLabelText("Name").clear().type("Orders question");
    modal().button("Save").click();
    cy.wait("@createCard");
    modal().button("Not now").click();

    await page.locator('text="New"').click();
    popover().findByText("Question").click();
    popover().findByText("Saved Questions").click();
    popover().findByText("Orders question").should("be.visible");
  });

  test("should show Models section after creation the first model (metabase#24878)", async ({ page }) => {
    await page.goto("/");

    await page.locator('text="New"').click();
    popover().findByText("Question").click();
    popover().findByText("Orders").click();
    await page.locator('text="Save"').click();
    modal().findByLabelText("Name").clear().type("Orders model");
    modal().button("Save").click();
    cy.wait("@createCard");
    modal().button("Not now").click();

    await page.locator('aria-label="Move, archive, and more..."').click();
    popover().findByText("Turn into a model").click();
    modal().button("Turn this into a model").click();
    cy.wait("@updateCard");

    await page.locator('text="New"').click();
    popover().findByText("Question").click();
    popover().findByText("Models").click();
    popover().findByText("Orders model").should("be.visible");
  });
});
