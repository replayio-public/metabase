import {
  version,
  setupLanguage,
  setupInstance,
} from "./helpers/cross-version-source-helpers";


test.describe(`setup on ${version}`, () => {
  test("should set up metabase", async ({ page }) => {
    await page.goto("/");
    // It redirects to the setup page
    await expect(page.locator("pathname")).toEqual("/setup");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Welcome to Metabase"');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Let\'s get started"').click();

    setupLanguage();
    setupInstance(version);

    // Quick and dirty sanity check for EE version
    // TODO: Remove or refactor properly
    if (version.startsWith("v1")) {
      await page.goto("/admin/settings/license");
      await expect(page.locator('placeholder="Using MB_PREMIUM_EMBEDDING_TOKEN"')).toBeDisabled();
    } else {
      await page.goto("/admin");
      await page.locator('icon="store"');
    }
  });
});
