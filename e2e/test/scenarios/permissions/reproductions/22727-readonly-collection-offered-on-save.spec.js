import { restore, visitQuestion, popover } from "e2e/support/helpers";
import { USER_GROUPS } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;


test.describe("issue 22727", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    // Let's give all users a read only access to "Our analytics"
    cy.updateCollectionGraph({
      [ALL_USERS_GROUP]: { root: "read" },
    });

    cy.signIn("nocollection");
  });

  test("should not offer to save question in view only collection (metabase#22727, metabase#20717)", async ({ page }) => {
    // It is important to start from a saved question and to alter it.
    // We already have a reproduction that makes sure "Our analytics" is not offered when starting from an ad-hoc question (table).
    visitQuestion(1);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="31.44"').click();
    popover().contains("=").click();
    await page.waitForResponse("@dataset");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Save"').click();

    await page.locator(".Modal").within(() => {
      // This part reproduces https://github.com/metabase/metabase/issues/20717
      page.locator('text=/^Replace original qeustion/').should("not.exist");

      // This part is an actual repro for https://github.com/metabase/metabase/issues/22727
      page.locator('[data-testid="select-button-content"]')
        .invoke("text")
        .should("not.eq", "Our analytics");
    });
  });
});

