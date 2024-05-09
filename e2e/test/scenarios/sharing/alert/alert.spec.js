import {
  restore,
  setupSMTP,
  mockSlackConfigured,
  visitQuestion,
} from "e2e/support/helpers";

const channels = { slack: mockSlackConfigured, email: setupSMTP };


test.describe("scenarios > alert", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test.describe("with nothing set", () => {
    test('should prompt you to add email/slack credentials', async ({ page }) => {
      visitQuestion(1);
      await page.locator('icon[name="bell"]').click();

      await page.locator(':text("To send alerts, you\'ll need to set up email or Slack integration.")');
    });

    test('should say to non-admins that admin must add email credentials', async ({ page }) => {
      await signInAsNormalUser();

      visitQuestion(1);
      await page.locator('icon[name="bell"]').click();

      await page.locator(':text("To send alerts, an admin needs to set up email integration.")');
    });
  });

  Object.entries(channels).forEach(([channel, setup]) => {
    test.describe(`with ${channel} set up`, { tags: "@external" }, () => {
      test.beforeEach(async () => {
        await setup();
      });

      test('educational screen should show for the first alert, but not for the second', async ({ page }) => {
        await page.route("POST", "/api/alert");
        await page.route("POST", "/api/card/2/query");

        // Open the first alert screen and create an alert
        visitQuestion(1);
        await page.locator('icon[name="bell"]').click();

        await page.locator(':text("The wide world of alerts")');
        await page.locator(':text("There are a few different kinds of alerts you can get")');

        await page.locator(':text("When a raw data question returns any results")');
        await page.locator(':text("When a line or bar crosses a goal line")');
        await page.locator(':text("When a progress bar reaches its goal")');

        await page.locator(':text("Set up an alert")').click();
        await page.locator(':text("Done")').click();

        await page.waitForResponse("/api/alert");

        // Open the second alert screen
        visitQuestion(2);
        await page.waitForResponse("/api/card/2/query");

        await page.locator('icon[name="bell"]').click();

        await page.locator(':text("Let\'s set up your alert")');
        await page.locator(':text("The wide world of alerts")').should("not.exist");
      });
    });
  });
});

