import { restore, sidebar, visitDashboard } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const {
  admin: { first_name, last_name },
} = USERS;


test.describe("issue 17657", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    createSubscriptionWithoutRecipients();
  });

  test("frontend should gracefully handle the case of a subscription without a recipient (metabase#17657)", async ({ page }) => {
    visitDashboard(1);

    await page.locator('icon[data-testid="subscription"]').click();

    await page.locator('text=^Emailed monthly').click();

    await sidebar().within(async () => {
      await expect(page.locator('button:text("Done")')).toBeDisabled();
    });

    // Open the popover with all users
    await page.locator('input[placeholder="Enter user names or email addresses"]').click();
    // Pick admin as a recipient
    await page.locator(`text=${first_name} ${last_name}`).click();

    await sidebar().within(async () => {
      await expect(page.locator('button:text("Done")')).not.toBeDisabled();
    });
  });
});



async function createSubscriptionWithoutRecipients() {
  await page.request("POST", "/api/pulse", {
    name: "Orders in a dashboard",
    cards: [
      {
        id: 1,
        collection_id: null,
        description: null,
        display: "table",
        name: "Orders",
        include_csv: false,
        include_xls: false,
        dashboard_card_id: 1,
        dashboard_id: 1,
        parameter_mappings: [],
      },
    ],
    channels: [
      {
        channel_type: "email",
        enabled: true,
        // Since the fix (https://github.com/metabase/metabase/pull/17668), this is not even possible to do in the UI anymore.
        // Backend still doesn't do this validation so we're making sure the FE handles the case of missing recipients gracefully.
        recipients: [],
        details: {},
        schedule_type: "monthly",
        schedule_day: "mon",
        schedule_hour: 8,
        schedule_frame: "first",
      },
    ],
    skip_if_empty: false,
    collection_id: null,
    parameters: [],
    dashboard_id: 1,
  });
}

