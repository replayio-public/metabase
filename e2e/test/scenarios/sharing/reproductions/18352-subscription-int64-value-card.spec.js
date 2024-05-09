import {
  restore,
  setupSMTP,
  visitQuestion,
  visitDashboard,
  sendEmailAndAssert,
} from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const {
  admin: { first_name, last_name },
} = USERS;

const questionDetails = {
  name: "18352",
  native: {
    query: "SELECT 'foo', 1 UNION ALL SELECT 'bar', 2",
  },
};


test.describe("issue 18352", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    setupSMTP();

    await createNativeQuestionAndDashboard({ questionDetails }).then(
      async ({ body: { card_id, dashboard_id } }) => {
        visitQuestion(card_id);

        visitDashboard(dashboard_id);
      },
    );
  });

  test("should send the card with the INT64 values (metabase#18352)", async ({ page }) => {
    await page.locator('icon[name="subscription"]').click();

    await page.locator('text="Email it"').click();

    await page.locator('input[placeholder="Enter user names or email addresses"]').click();
    await page.locator(`text="${first_name} ${last_name}"`).click();
    // Click this just to close the popover that is blocking the "Send email now" button
    await page.locator('text="To:"').click();

    sendEmailAndAssert(async ({ html }) => {
      expect(html).not.to.include(
        "An error occurred while displaying this card.",
      );

      expect(html).to.include("foo");
      expect(html).to.include("bar");
    });
  });
});

