import { restore, setupSMTP } from "e2e/support/helpers";
import { WEBMAIL_CONFIG } from "e2e/support/cypress_data";

const { SMTP_PORT, WEB_PORT } = WEBMAIL_CONFIG;

test.describe("scenarios > admin > settings > email settings", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should be able to save email settings (metabase#17615)', async ({ page }) => {
    await page.goto('/admin/settings/email');
    await page.locator('input[aria-label="SMTP Host"]').fill('localhost').blur();
    await page.locator('input[aria-label="SMTP Port"]').fill(SMTP_PORT).blur();
    await page.locator('input[aria-label="SMTP Username"]').fill('admin').blur();
    await page.locator('input[aria-label="SMTP Password"]').fill('admin').blur();
    await page.locator('input[aria-label="From Address"]').fill('mailer@metabase.test').blur();
    await page.locator('input[aria-label="From Name"]').fill('Sender Name').blur();
    await page.locator('input[aria-label="Reply-To Address"]').fill('reply-to@metabase.test').blur();
    await page.locator('button:text("Save changes")').click();

    await page.locator('text("Changes saved!")', { timeout: 10000 });

    await page.locator('input[value="localhost"]');
    await page.locator('input[value="' + SMTP_PORT + '"]');
    await page.locator('input[value="admin"]');
    await page.locator('input[value="mailer@metabase.test"]');
    await page.locator('input[value="Sender Name"]');
    await page.locator('input[value="reply-to@metabase.test"]');
  });

  // Other tests are omitted for brevity
});
