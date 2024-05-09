import {
  restore,
  openOrdersTable,
  popover,
  describeEE,
  setupMetabaseCloud,
  isOSS,
  isEE,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS } = SAMPLE_DATABASE;

test.describe("scenarios > admin > settings", () => {
  beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test(
    "should prompt admin to migrate to the hosted instance",
    { tags: "@OSS" },
    async ({ page }) => {
      await onlyOn(isOSS);
      await page.goto("/admin/settings/setup");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Have your server maintained for you.")).toBeVisible();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Migrate to Metabase Cloud.")).toBeVisible();
      await expect(page.locator("a:has-text('Learn more')"))
        .toHaveAttribute("href")
        .and("include", "/migrate/");
    },
  );

  test("should surface an error when validation for any field fails (metabase#4506)", async ({ page }) => {
    const BASE_URL = Cypress.config().baseUrl;
    const DOMAIN_AND_PORT = BASE_URL.replace("http://", "");

    await page.route("PUT", "/api/setting/site-url", async (route) => {
      route.reply(500, {
        cause: "Invalid site URL",
      });
    });

    await page.goto("/admin/settings/general");

    // Needed to strip down the protocol from URL to accomodate our UI (<select> PORT | <input> DOMAIN_AND_PORT)
    await expect(page.locator("input[value=$DOMAIN_AND_PORT]", { DOMAIN_AND_PORT })).toBeVisible();

    // extremely ugly hack because nothing else worked
    // for some reason, Cypress failed to clear this field quite often disrupting our CI
    await page.locator("input[value=$DOMAIN_AND_PORT]", { DOMAIN_AND_PORT })
      .click()
      .fill("foo")
      .click()
      .fill("other.email@metabase.test")
      .blur();

    // NOTE: This test is not concerned with HOW we style the error message - only that there is one.
    //       If we update UI in the future (for example: we show an error within a popup/modal), the test in current form could fail.
    await page.waitForSelector(".SaveStatus:has-text('Error: Invalid site URL')");
  });

  test("should save a setting", async ({ page }) => {
    await page.route("PUT", "**/admin-email");

    await page.goto("/admin/settings/general");

    // aliases don't last past refreshes, so create a function to grab the input
    // rather than aliasing it with .as()
    const emailInput = () =>
      page.locator("text=Email Address for Help Requests")
        .ancestor("div")
        .ancestor("div")
        .locator("input");

    // extremely ugly hack because nothing else worked
    // for some reason, Cypress failed to clear this field quite often disrupting our CI
    await emailInput()
      .click()
      .fill("abc")
      .click()
      .fill("other.email@metabase.test")
      .blur();

    await page.goto("/admin/settings/general");
    // after we refreshed, the field should still be "other.email"
    await expect(emailInput()).toHaveValue("other.email@metabase.test");
  });

  test("should check for working https before enabling a redirect", async ({ page }) => {
    await page.goto("/admin/settings/general");

    await page.route("GET", "**/api/health", "ok");

    // settings have loaded, but there's no redirect setting visible
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site URL")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Redirect to HTTPS")).not.toBeVisible();

    // switch site url to use https
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Site URL")
      .ancestor("div")
      .ancestor("div")
      .locator("[data-testid=select-button]")
      .click();
    await page.locator("text=https://").click({ force: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Redirect to HTTPS").ancestor("div").ancestor("div").locator("text=Disabled")).toBeVisible();

    restore(); // avoid leaving https site url
  });

  test("should display an error if the https redirect check fails", async ({ page }) => {
    await page.goto("/admin/settings/general");

    await page.route("GET", "**/api/health", (req) => {
      req.reply({ forceNetworkError: true });
    });

    // switch site url to use https
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Site URL")
      .ancestor("div")
      .ancestor("div")
      .locator("[data-testid=select-button]")
      .click();
    await page.locator("text=https://").click({ force: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=It looks like HTTPS is not properly configured")).toBeVisible();
  });

  test("should correctly apply the globalized date formats (metabase#11394) and update the formatting", async ({ page }) => {
    await page.route("PUT", "**/custom-formatting");

    await page.request("PUT", `/api/field/${ORDERS.CREATED_AT}`, {
      semantic_type: null,
    });

    await page.goto("/admin/settings/localization");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=January 7, 2018").click({ force: true });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=2018/1/7").click({ force: true });
    await expect(page.locator("[data-testid=select-button-content]")).toHaveText("2018/1/7");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=17:24 (24-hour clock)").click();
    await expect(page.locator("input[value='HH:mm']")).toBeChecked();

    await openOrdersTable({ limit: 2, page });

    await page.locator("text=Created At").toBeVisible();
    await expect(page.locator(".cellData"))
      .toHaveText("Created At")
      .and("contain", "2019/2/11, 21:40");

    // Go back to the settings and reset the time formatting
    await page.goto("/admin/settings/localization");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=5:24 PM (12-hour clock)").click();
    await expect(page.locator("input[value='h:mm A']")).toBeChecked();

    await openOrdersTable({ limit: 2, page });

    await page.locator("text=Created At").toBeVisible();
    await expect(page.locator(".cellData")).toHaveText("2019/2/11, 9:40 PM");
  });

  test("should search for and select a new timezone", async ({ page }) => {
    await page.route("PUT", "**/report-timezone");

    await page.goto("/admin/settings/localization");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Report Timezone")
      .ancestor("li")
      .locator("[data-testid=report-timezone-select-button]")
      .click();

    await page.locator("input[placeholder='Find...']").type("Centr");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=US/Central").click({ force: true });

    await expect(page.locator("text=US/Central")).toBeVisible();
  });

  test("'General' admin settings should handle setup via `MB_SITE_URL` environment variable (metabase#14900)", async ({ page }) => {
    // 1. Get the array of ALL available settings
    const settings = await page.request("GET", "/api/setting");

    // 2. Create a stubbed version of that array by passing modified "site-url" settings
    const STUBBED_BODY = settings.map(setting => {
      if (setting.key === "site-url") {
        const STUBBED_SITE_URL = Object.assign({}, setting, {
          is_env_setting: true,
          value: null,
        });

        return STUBBED_SITE_URL;
      }
      return setting;
    });

    // 3. Stub the whole response
    await page.route("GET", "/api/setting", { body: STUBBED_BODY });

    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=We're a little lost...")).not.toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site name")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site URL")).toBeVisible();
  });

  test(
    "should display the order of the settings items consistently between OSS/EE versions (metabase#15441)",
    { tags: "@OSS" },
    async ({ page }) => {
      const lastItem = isEE ? "Appearance" : "Metabot";

      await page.goto("/admin/settings/setup");
      await expect(page.locator(".AdminList .AdminList-item").first()).toHaveText("Setup");
      await expect(page.locator(".AdminList .AdminList-item").last()).toHaveText(lastItem);
    },
  );

  // Unskip when mocking Cloud in Cypress is fixed (#18289)
  test.skip("should hide self-hosted settings when running Metabase Cloud", async ({ page }) => {
    setupMetabaseCloud();
    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site Name")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site URL")).not.toBeVisible();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Email")).not.toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Updates")).not.toBeVisible();
  });

  // Unskip when mocking Cloud in Cypress is fixed (#18289)
  test.skip("should hide the store link when running Metabase Cloud", async ({ page }) => {
    setupMetabaseCloud();
    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Metabase Admin")).toBeVisible();
    await expect(page.locator("aria-label=store icon")).not.toBeVisible();
  });

  test.describe(" > slack settings", () => {
    test("should present the form and display errors", async ({ page }) => {
      await page.goto("/admin/settings/slack");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Metabase on Slack")).toBeVisible();
      await page.locator("aria-label=Slack Bot User OAuth Token").type("xoxb");
      await page.locator("aria-label=Public channel to store image files").type(
        "metabase_files",
      );
      await page.locator("button:text('Save changes')").click();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=: invalid token")).toBeVisible();
    });
  });
});

test.describe("scenarios > admin > settings (OSS)", { tags: "@OSS" }, () => {
  beforeEach(async ({ page }) => {
    await onlyOn(isOSS);
    restore();
    await signInAsAdmin(page);
  });

  test("should show the store link when running Metabase OSS", async ({ page }) => {
    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Metabase Admin")).toBeVisible();
    await expect(page.locator("aria-label=store icon")).toBeVisible();
  });
});

describeEE("scenarios > admin > settings (EE)", () => {
  beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  // Unskip when mocking Cloud in Cypress is fixed (#18289)
  test.skip("should hide Enterprise page when running Metabase Cloud", async ({ page }) => {
    setupMetabaseCloud();
    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Site Name")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Enterprise")).not.toBeVisible();
  });

  test("should hide the store link when running Metabase EE", async ({ page }) => {
    await page.goto("/admin/settings/general");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Metabase Admin")).toBeVisible();
    await expect(page.locator("aria-label=store icon")).not.toBeVisible();
  });
});
