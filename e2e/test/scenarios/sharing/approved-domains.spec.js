import {
  describeEE,
  restore,
  setupSMTP,
  sidebar,
  visitQuestion,
  visitDashboard,
} from "e2e/support/helpers";

const allowedDomain = "metabase.test";
const deniedDomain = "metabase.example";
const deniedEmail = `mailer@${deniedDomain}`;
const subscriptionError = `You're only allowed to email subscriptions to addresses ending in ${allowedDomain}`;
const alertError = `You're only allowed to email alerts to addresses ending in ${allowedDomain}`;

describeEE(
  "scenarios > sharing > approved domains (EE)",
  { tags: "@external" },
  test.describe("should validate approved email domains for a question alert", () => {
    test.beforeEach(async () => {
      restore();
      cy.signInAsAdmin();
      setupSMTP();
      setAllowedDomains();
    });

    test("should validate approved email domains for a question alert", async ({ page }) => {
      visitQuestion(1);

      await page.locator('icon[name="bell"]').click();
      await page.locator('text="Set up an alert"').click();

      await page.locator('text="Email alerts to:"').parent().within(() => addEmailRecipient(deniedEmail));

      await expect(page.locator('button:text("Done")')).toBeDisabled();
      await page.locator('text=alertError');
    });

    test.skip("should validate approved email domains for a dashboard subscription (metabase#17977)", async ({ page }) => {
      visitDashboard(1);
      await page.locator('icon[name="subscription"]').click();
      await page.locator('text="Email it"').click();

      sidebar().within(() => {
        addEmailRecipient(deniedEmail);

        await expect(page.locator('button:text("Send email now")')).toBeDisabled();
        await expect(page.locator('button:text("Done")')).toBeDisabled();
        await page.locator('text=subscriptionError');
      });
    });
  },
);

async function addEmailRecipient(email, page) {
  await page.locator('input[role="textbox"]').click().type(`${email}`).blur();
}

async function setAllowedDomains() {
  cy.request("PUT", "/api/setting/subscription-allowed-domains", {
    value: allowedDomain,
  });
}
