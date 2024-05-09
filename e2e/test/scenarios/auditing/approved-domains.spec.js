import {
  describeEE,
  modal,
  restore,
  setupSMTP,
  sidebar,
  visitQuestion,
  visitDashboard,
} from "e2e/support/helpers";

const allowedDomain = "metabase.test";
const deniedDomain = "metabase.example";
const allowedEmail = `mailer@${allowedDomain}`;
const deniedEmail = `mailer@${deniedDomain}`;
const subscriptionError = `You're only allowed to email subscriptions to addresses ending in ${allowedDomain}`;
const alertError = `You're only allowed to email alerts to addresses ending in ${allowedDomain}`;

describeEE(
  "scenarios > sharing > approved domains (EE)",
  { tags: "@external" },
  async ({ page }) => {
    beforeEach(async () => {
      restore();
      await signInAsAdmin(page);
      await setupSMTP(page);
      await setAllowedDomains(page);
    });

    test("should validate approved email domains for a question alert in the audit app", async () => {
      await visitQuestion(page, 1);
      await page.locator('icon("bell")').click();
      await page.locator('text("Set up an alert")').click();
      await page.locator('button("Done")').click();
      await page.locator('text("Your alert is all set up.")');

      await page.goto("/admin/audit/subscriptions/alerts");
      await page.locator('text("1")').click();

      await modal(page).within(async () => {
        await addEmailRecipient(page, deniedEmail);

        await expect(page.locator('button("Update")')).toBeDisabled();
        await page.locator('text(alertError)');
      });
    });

    test("should validate approved email domains for a dashboard subscription in the audit app", async () => {
      await visitDashboard(page, 1);
      await page.locator('icon("share")').click();
      await page.locator('text("Dashboard subscriptions")').click();
      await page.locator('text("Email it")').click();

      await sidebar(page).within(async () => {
        await addEmailRecipient(page, allowedEmail);
        await page.locator('button("Done")').click();
      });

      await page.goto("/admin/audit/subscriptions/subscriptions");
      await page.locator('text("1")').click();

      await modal(page).within(async () => {
        await addEmailRecipient(page, deniedEmail);

        await expect(page.locator('button("Update")')).toBeDisabled();
        await page.locator('text(subscriptionError)');
      });
    });
  },
);

async function addEmailRecipient(page, email) {
  await page.locator('role("textbox")').click().type(`${email}`).blur();
}

async function setAllowedDomains(page) {
  await page.request("PUT", "/api/setting/subscription-allowed-domains", {
    value: allowedDomain,
  });
}
