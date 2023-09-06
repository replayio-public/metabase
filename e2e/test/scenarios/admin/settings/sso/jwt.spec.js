import {
  restore,
  describeEE,
  typeAndBlurUsingLabel,
  modal,
  popover,
} from "e2e/support/helpers";

import {
  crudGroupMappingsWidget,
  checkGroupConsistencyAfterDeletingMappings,
} from "./group-mappings-widget";

describeEE("scenarios > admin > settings > SSO > JWT", (() => {
  beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.route("PUT", "/api/setting");
    await page.route("PUT", "/api/setting/*");
  });

  test("should allow to save and enable jwt", async ({ page }) => {
    await page.goto("/admin/settings/authentication/jwt");

    enterJwtSettings();
    await page.locator('button:text("Save and enable")').click();
    await page.waitForResponse("/api/setting");
    await page.locator('a[role="link"]:text("Authentication")').first().click();

    getJwtCard().findByText("Active").should("exist");
  });

  test("should allow to disable and enable jwt", async ({ page }) => {
    setupJwt();
    await page.goto("/admin/settings/authentication");

    getJwtCard().icon("ellipsis").click();
    popover().findByText("Pause").click();
    await page.waitForResponse("/api/setting/*");
    getJwtCard().findByText("Paused").should("exist");

    getJwtCard().icon("ellipsis").click();
    popover().findByText("Resume").click();
    await page.waitForResponse("/api/setting/*");
    getJwtCard().findByText("Active").should("exist");
  });

  test("should allow to reset jwt settings", async ({ page }) => {
    setupJwt();
    await page.goto("/admin/settings/authentication");

    getJwtCard().icon("ellipsis").click();
    popover().findByText("Deactivate").click();
    modal().button("Deactivate").click();
    await page.waitForResponse("/api/setting");

    getJwtCard().findByText("Set up").should("exist");
  });

  test("should allow to regenerate the jwt key and save the settings", async ({ page }) => {
    setupJwt();
    await page.goto("/admin/settings/authentication/jwt");

    await page.locator('button:text("Regenerate key")').click();
    modal().button("Yes").click();
    await page.locator('button:text("Save changes")').click();
    await page.waitForResponse("/api/setting");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text("Success")').should("exist");
  });

  describe("Group Mappings Widget", () => {
    beforeEach(async ({ page }) => {
      await page.route("GET", "/api/setting");
      await page.route("GET", "/api/session/properties");
      await page.route("DELETE", "/api/permissions/group/*");
      await page.route("PUT", "/api/permissions/membership/*/clear");
    });

    test("should allow deleting mappings along with deleting, or clearing users of, mapped groups", async ({ page }) => {
      crudGroupMappingsWidget("jwt");
    });

    test("should allow deleting mappings with groups, while keeping remaining mappings consistent with their undeleted groups", async ({ page }) => {
      checkGroupConsistencyAfterDeletingMappings("jwt");
    });
  });
});

const getJwtCard = (() => {
  return page.locator('text("JWT")').parent().parent();
};

const setupJwt = (async () => {
  await page.request("PUT", "/api/setting", {
    "jwt-enabled": true,
    "jwt-identity-provider-uri": "https://example.text",
    "jwt-shared-secret": "0".repeat(64),
  });
};

const enterJwtSettings = (async () => {
  typeAndBlurUsingLabel("JWT Identity Provider URI", "https://example.test");
  await page.locator('button:text("Generate key")').click();
};
