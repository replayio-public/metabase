import {
  isOSS,
  describeEE,
  restore,
  setupMetabaseCloud,
} from "e2e/support/helpers";

test.describe("scenarios > admin > troubleshooting > help", () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    await restore();
    await signInAsAdmin();
  });

  // Unskip when mocking Cloud in Playwright is fixed (#18289)
  test.skip("should add the support link when running Metabase Cloud", async ({ page }) => {
    setupMetabaseCloud();
    await page.goto("/admin/troubleshooting/help");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Metabase Admin");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Contact support");
  });
});

test.describe("scenarios > admin > troubleshooting > help", { tags: "@OSS" }, () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    cy.onlyOn(isOSS);

    await restore();
    await signInAsAdmin();
  });

  test("should link `Get Help` to help", async ({ page }) => {
    await page.goto("/admin/troubleshooting/help");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Metabase Admin");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    const getHelpLink = await page.locator("text=Get Help").elementHandle();
    const href = await getHelpLink.getAttribute("href");
    expect(href).toMatch(
      /^https:\/\/www\.metabase\.com\/help\?utm_source=in-product&utm_medium=troubleshooting&utm_campaign=help&instance_version=v(?:(?!diag=).)+$/,
    );
  });
});

describeEE("scenarios > admin > troubleshooting > help (EE)", () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    await restore();
    await signInAsAdmin();
  });

  test("should link `Get Help` to help-premium", async ({ page }) => {
    await page.goto("/admin/troubleshooting/help");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Metabase Admin");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    const getHelpLink = await page.locator("text=Get Help").elementHandle();
    const href = await getHelpLink.getAttribute("href");
    expect(href).toMatch(
      /^https:\/\/www\.metabase\.com\/help-premium\?utm_source=in-product&utm_medium=troubleshooting&utm_campaign=help&instance_version=v.+&diag=%7B.+%7D$/,
    );
  });
});
