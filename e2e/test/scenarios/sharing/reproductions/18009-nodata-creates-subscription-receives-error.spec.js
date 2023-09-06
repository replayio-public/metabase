import {
  restore,
  popover,
  setupSMTP,
  visitDashboard,
  sendEmailAndAssert,
} from "e2e/support/helpers";


test.describe("issue 18009", () => {
  test.beforeEach(async () => {
    restore();
    await cy.signInAsAdmin();

    setupSMTP();

    await cy.signIn("nodata");
  });

  test("nodata user should be able to create and receive an email subscription without errors (metabase#18009)", async ({ page }) => {
    visitDashboard(1);

    await page.locator('[aria-label="subscription"]').click();

    await page.locator('text=Email it').click();

    await page.locator('[placeholder="Enter user names or email addresses"]').click();
    popover()
      .contains(/^No Data/)
      .click();

    // Click anywhere to close the popover that covers the "Send email now" button
    await page.locator('text=To:').click();

    sendEmailAndAssert(email => {
      expect(email.html).not.to.include(
        "An error occurred while displaying this card.",
      );

      expect(email.html).to.include("37.65");
    });
  });
});

