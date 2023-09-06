import { restore } from "e2e/support/helpers/e2e-setup-helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { modal } from "e2e/support/helpers/e2e-ui-elements-helpers";

const { ORDERS_ID } = SAMPLE_DATABASE;

const getQuestionDetails = () => ({
  name: "Question",
  query: {
    "source-table": ORDERS_ID,
  },
});

const getAlertDetails = ({ card_id, user_id, admin_id }) => ({
  card: {
    id: card_id,
    include_csv: false,
    include_xls: false,
  },
  channels: [
    {
      enabled: true,
      channel_type: "email",
      schedule_type: "hourly",
      recipients: [
        {
          id: user_id,
        },
        {
          id: admin_id,
        },
      ],
    },
  ],
});

const getPulseDetails = ({ card_id, dashboard_id }) => ({
  name: "Subscription",
  dashboard_id,
  cards: [
    {
      id: card_id,
      include_csv: false,
      include_xls: false,
    },
  ],
  channels: [
    {
      enabled: true,
      channel_type: "slack",
      schedule_type: "hourly",
    },
  ],
});

test.describe("scenarios > account > notifications", () => {
  test.beforeEach(async () => {
    restore();
  });

  test.describe("alerts", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsAdmin(page);
      const { admin_id, user_id, card_id } = await setupAlerts(page);
    });

    test("should be able to see help info", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Not seeing one here?"').click();

      await modal().within(async () => {
        await page.locator('text="Not seeing something listed here?"');
        await page.locator('text="Got it"').click();
      });

      await expect(modal()).not.toBeVisible();
    });

    test("should be able to see alerts notifications", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Question"');
      await page.locator('text="Emailed hourly"').isVisible({ strict: false });
      await page.locator('text="Created by you"').isVisible({ strict: false });
    });

    test("should be able to unsubscribe and delete an alert when the user created it", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Question"');
      await clickUnsubscribe(page);

      await modal().within(async () => {
        await page.locator('text="Confirm you want to unsubscribe"');
        await page.locator('text="Unsubscribe"').click();
        await expect(page.locator('text="Unsubscribe"')).not.toBeVisible();
      });

      await modal().within(async () => {
        await page.locator('text="You’re unsubscribed. Delete this alert as well?"');
        await page.locator('text="Delete this alert"').click();
      });

      await expect(modal()).not.toBeVisible();
      await expect(page.locator('[data-testid="notification-list"]')).not.toBeVisible();
    });

    test("should be able to unsubscribe from an alert when the user has not created it", async ({ page }) => {
      await signOut(page);
      await signInAsAdmin(page);
      await openUserNotifications(page);

      await page.locator('text="Question"');
      await clickUnsubscribe(page);

      await modal().within(async () => {
        await page.locator('text="Confirm you want to unsubscribe"');
        await page.locator('text="Unsubscribe"').click();
      });

      await expect(page.locator('text="Question"')).not.toBeVisible();
    });
  });

  test.describe("pulses", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsNormalUser(page);
      const { card_id, dashboard_id } = await setupPulses(page);
    });

    test("should be able to see help info", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Not seeing one here?"').click();

      await modal().within(async () => {
        await page.locator('text="Not seeing something listed here?"');
        await page.locator('text="Got it"').click();
      });

      await expect(modal()).not.toBeVisible();
    });

    test("should be able to see pulses notifications", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Subscription"');
      await page.locator('text="Slack’d hourly"').isVisible({ strict: false });
      await page.locator('text="Created by you"').isVisible({ strict: false });
    });

    test("should be able to unsubscribe and delete a pulse when the user has created it", async ({ page }) => {
      await openUserNotifications(page);

      await page.locator('text="Subscription"');
      await clickUnsubscribe(page);

      await modal().within(async () => {
        await page.locator('text="Delete this subscription?"');
        await page.locator('text="Yes, delete this subscription"').click();
      });

      await expect(page.locator('text="Subscription"')).not.toBeVisible();
    });
  });
});

async function clickUnsubscribe(page) {
  await page.locator('[data-testid="notifications-list"]').within(async () => {
    await page.locator('[aria-label="close icon"]').click();
  });
}

async function openUserNotifications(page) {
  await page.route("GET", "/api/pulse?*", route => route.fulfill({ status: 200 }));
  await page.goto("/account/notifications");
  await page.waitForResponse("/api/pulse?*");
}
