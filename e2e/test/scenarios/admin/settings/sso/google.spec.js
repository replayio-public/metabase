import {
  modal,
  popover,
  restore,
  typeAndBlurUsingLabel,
} from "e2e/support/helpers";

const CLIENT_ID_SUFFIX = "apps.googleusercontent.com";

test.describe("scenarios > admin > settings > SSO > Google", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("PUT", "/api/setting").as("updateSettings");
    cy.intercept("PUT", "/api/setting/*").as("updateSetting");
    cy.intercept("PUT", "/api/google/settings").as("updateGoogleSettings");
  });

  test('should save the client id on subsequent tries (metabase#15974)', async ({ page }) => {
    await page.goto('/admin/settings/authentication/google');

    await typeAndBlurUsingLabel("Client ID", "example1.apps.googleusercontent.com");
    await page.locator('button:text("Save and enable")').click();
    await page.waitForResponse("@updateGoogleSettings");
    await page.reload();
    await expect(page.locator('input[value="example1.apps.googleusercontent.com"]')).toBeVisible();

    await typeAndBlurUsingLabel("Client ID", `example2.${CLIENT_ID_SUFFIX}`);
    await page.locator('button:text("Save changes")').click();
    await page.waitForResponse("@updateGoogleSettings");
    await expect(page.locator('text("Success")')).toBeVisible();
  });

  test('should allow to disable and enable google auth (metabase#20442)', async ({ page }) => {
    setupGoogleAuth();
    await page.goto('/admin/settings/authentication');

    await getGoogleCard().icon("ellipsis").click();
    await popover().findByText("Pause").click();
    await page.waitForResponse("@updateSetting");
    await expect(getGoogleCard().locator('text("Paused")')).toBeVisible();

    await getGoogleCard().icon("ellipsis").click();
    await popover().findByText("Resume").click();
    await page.waitForResponse("@updateSetting");
    await expect(getGoogleCard().locator('text("Active")')).toBeVisible();
  });

  test('should allow to reset google settings', async ({ page }) => {
    setupGoogleAuth();
    await page.goto('/admin/settings/authentication');

    await getGoogleCard().icon("ellipsis").click();
    await popover().findByText("Deactivate").click();
    await modal().button("Deactivate").click();
    await page.waitForResponse("@updateSettings");

    await expect(getGoogleCard().locator('text("Set up")')).toBeVisible();
  });

  test('should show an error message if the client id does not end with the correct suffix (metabase#15975)', async ({ page }) => {
    await page.goto('/admin/settings/authentication/google');

    await typeAndBlurUsingLabel("Client ID", "fake-client-id");
    await page.locator('button:text("Save and enable")').click();
    await expect(page.locator(`text("Invalid Google Sign-In Client ID: must end with ".${CLIENT_ID_SUFFIX}"")`)).toBeVisible();
  });

  test('should show the button to sign in via google only when enabled', async ({ page }) => {
    setupGoogleAuth({ enabled: true });
    cy.signOut();
    await page.goto('/auth/login');
    await expect(page.locator('text("Sign in with email")')).toBeVisible();
    await expect(page.locator('button:text(/Google/)')).toBeVisible();

    cy.signInAsAdmin();
    setupGoogleAuth({ enabled: false });
    cy.signOut();
    await page.goto('/auth/login');
    await expect(page.locator('text("Email address")')).toBeVisible();
    await expect(page.locator('text("Password")')).toBeVisible();
    await expect(page.locator('button:text(/Google/)')).not.toBeVisible();
  });
});

const getGoogleCard = () => {
  return page.locator('text("Sign in with Google")').parent().parent();
};

const setupGoogleAuth = (async ({ enabled = true } = {}) => {
  await cy.request("PUT", "/api/google/settings", {
    "google-auth-enabled": enabled,
    "google-auth-client-id": `example.${CLIENT_ID_SUFFIX}`,
    "google-auth-auto-create-accounts-domain": "example.test",
  });
});
