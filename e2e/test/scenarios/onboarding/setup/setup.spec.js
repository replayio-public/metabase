import {
  blockSnowplow,
  describeWithSnowplow,
  expectGoodSnowplowEvents,
  expectNoBadSnowplowEvents,
  resetSnowplow,
  restore,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const { admin } = USERS;

// we're testing for one known (en) and one unknown (xx) locale
const locales = ["en", "xx"];

test.describe("scenarios > setup", () => {
  locales.forEach(locale => {
    test.beforeEach(async () => restore("blank"));

    test(`should allow you to sign up using "${locale}" browser locale`, async ({ page }) => {
      // intial redirection and welcome page
      await page.goto("/", {
        locale,
      });
      await expect(page.locator('pathname')).toEqual("/setup");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Welcome to Metabase");
      await page.locator("text=Let's get started").click();

      // ========
      // Language
      // ========

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=What's your preferred language?");
      await page.locator("label=English");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Next").click();

      // ====
      // User
      // ====

      // "Next" should be disabled on the blank form
      // NOTE: unclear why cy.findByText("Next", { selector: "button" }) doesn't work
      // alternative: cy.contains("Next").should("be.disabled");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Next").closest("button")).toBeDisabled();

      await page.locator("label=First name").type("Testy");
      await page.locator("label=Last name").type("McTestface");
      await page.locator("label=Email").type("testy@metabase.test");
      await page.locator("label=Company or team name").type("Epic Team");

      // test first with a weak password
      await page.locator("label=Create a password").type("password");
      await page.locator("label=Confirm your password").type("password");

      // the form shouldn't be valid yet and we should display an error
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=must include one number", { exact: false });
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Next").closest("button")).toBeDisabled();

      // now try a strong password that doesn't match
      const strongPassword = "QJbHYJN3tPW[";
      await page.locator("label=Create a password")
        .clear()
        .type(strongPassword);
      await page.locator("label=Confirm your password")
        .clear()
        .type(strongPassword + "foobar")
        .blur();

      // tell the user about the mismatch after clicking "Next"
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Next").closest("button")).toBeDisabled();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=passwords do not match", { exact: false });

      // fix that mismatch
      await page.locator("label=Confirm your password")
        .clear()
        .type(strongPassword);

      // Submit the first section
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Next").click();

      // ========
      // Database
      // ========

      // The database step should be open
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Add your data");

      // test database setup help card is NOT displayed before DB is selected
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Need help connecting?").should("not.be.visible");

      // test that you can return to user settings if you want
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Hi, Testy. Nice to meet you!").click();
      await page.locator("label=Email").should("have.value", "testy@metabase.test");

      // test database setup help card is NOT displayed on other steps
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Need help connecting?").should("not.be.visible");

      // now back to database setting
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Next").click();

      // check database setup card is visible
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=MySQL").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Need help connecting?").should("be.visible");

      await page.locator("label=Remove database").click();
      await page.locator("input[placeholder='Search for a database…']").type("SQL");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=SQLite").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Need help connecting?");

      // add h2 database
      await page.locator("label=Remove database").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Show more options").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=H2").click();
      await page.locator("label=Display name").type("Metabase H2");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Connect database").closest("button")).toBeDisabled();

      const dbFilename = "e2e/runner/empty.db";
      const dbPath = Cypress.config("fileServerFolder") + "/" + dbFilename;
      await page.locator("label=Connection String").type(`file:${dbPath}`);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator("text=Connect database")
        .closest("button")
        .should("not.be.disabled")
        .click());

      // test database setup help card is hidden on the next step
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Need help connecting?").should("not.be.visible");

      // ================
      // Data Preferences
      // ================

      // collection defaults to on and describes data collection
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=All collection is completely anonymous.");
      // turn collection off, which hides data collection description
      await page.locator("label=Allow Metabase to anonymously collect usage events").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=All collection is completely anonymous.").should("not.exist");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Finish").click();

      // ==================
      // Finish & Subscribe
      // ==================
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=You're all set up!");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Get infrequent emails about new releases and feature updates.");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator("text=Take me to Metabase").click();
      await expect(page.locator('pathname')).toEqual("/");
    });
  });
});

describeWithSnowplow("scenarios > setup", test.describe("scenarios > setup", () => {
  test.beforeEach(async () => {
    restore("blank");
    resetSnowplow();
  });

  test.afterEach(async () => {
    expectNoBadSnowplowEvents();
  });

  test("should send snowplow events", async ({ page }) => {
    // 1 - new_instance_created
    // 2 - pageview
    await page.goto(`/setup`);

    // 3 - setup/step_seen
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Welcome to Metabase");
    await page.locator("text=Let's get started").click();

    // 4 - setup/step_seen
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=What's your preferred language?");

    expectGoodSnowplowEvents(4);
  });

  test("should ignore snowplow failures and work as normal", async ({ page }) => {
    blockSnowplow();
    await page.goto(`/setup`);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Welcome to Metabase");
    await page.locator("text=Let's get started").click();

    expectGoodSnowplowEvents(1);
  });
}););
