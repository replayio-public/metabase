import {
  restore,
  describeEE,
  typeAndBlurUsingLabel,
  popover,
  modal,
} from "e2e/support/helpers";

import {
  crudGroupMappingsWidget,
  checkGroupConsistencyAfterDeletingMappings,
} from "./group-mappings-widget";

describeEE("scenarios > admin > settings > SSO > SAML", test.describe('scenarios > admin > settings > SSO > SAML', () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("PUT", "/api/setting").as("updateSettings");
    cy.intercept("PUT", "/api/setting/*").as("updateSetting");
    cy.intercept("PUT", "/api/saml/settings").as("updateSamlSettings");
  });

  test('should allow to save and enable saml', async ({ page }) => {
    cy.visit("/admin/settings/authentication/saml");

    enterSamlSettings();
    cy.button("Save and enable").click();
    cy.wait("@updateSamlSettings");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Success").should("exist");

    cy.findAllByRole("link", { name: "Authentication" }).first().click();
    getSamlCard().findByText("Active").should("exist");
  });

  test('should allow to update saml settings', async ({ page }) => {
    setupSaml();
    cy.visit("/admin/settings/authentication/saml");

    typeAndBlurUsingLabel("SAML Identity Provider URL", "https://other.test");
    cy.button("Save changes").click();
    cy.wait("@updateSamlSettings");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Success").should("exist");

    cy.findAllByRole("link", { name: "Authentication" }).first().click();
    getSamlCard().findByText("Active").should("exist");
  });

  test('should allow to disable and enable saml', async ({ page }) => {
    setupSaml();
    cy.visit("/admin/settings/authentication");

    getSamlCard().icon("ellipsis").click();
    popover().findByText("Pause").click();
    cy.wait("@updateSetting");
    getSamlCard().findByText("Paused").should("exist");

    getSamlCard().icon("ellipsis").click();
    popover().findByText("Resume").click();
    cy.wait("@updateSetting");
    getSamlCard().findByText("Active").should("exist");
  });

  test('should allow to reset saml settings', async ({ page }) => {
    setupSaml();
    cy.visit("/admin/settings/authentication");

    getSamlCard().icon("ellipsis").click();
    popover().findByText("Deactivate").click();
    modal().button("Deactivate").click();
    cy.wait("@updateSettings");

    getSamlCard().findByText("Set up").should("exist");
  });

  test.describe('Group Mappings Widget', () => {
    test.beforeEach(async ({ page }) => {
      cy.intercept("GET", "/api/setting").as("getSettings");
      cy.intercept("GET", "/api/session/properties").as("getSessionProperties");
      cy.intercept("DELETE", "/api/permissions/group/*").as("deleteGroup");
      cy.intercept("PUT", "/api/permissions/membership/*/clear").as(
        "clearGroup",
      );
    });

    test('should allow deleting mappings along with deleting, or clearing users of, mapped groups', async ({ page }) => {
      crudGroupMappingsWidget("saml");
    });

    test('should allow deleting mappings with groups, while keeping remaining mappings consistent with their undeleted groups', async ({ page }) => {
      checkGroupConsistencyAfterDeletingMappings("saml");
    });
  });
}));

const getSamlCard = const getSamlCard = () => {
  return cy.findByText("SAML").parent().parent();
};

const getSamlCertificate = const getSamlCertificate = () => {
  return cy.readFile("test_resources/sso/auth0-public-idp.cert", "utf8");
};

const setupSaml = const setupSaml = () => {
  getSamlCertificate().then(certificate => {
    cy.request("PUT", "/api/setting", {
      "saml-enabled": true,
      "saml-identity-provider-uri": "https://example.test",
      "saml-identity-provider-certificate": certificate,
    });
  });
};

const enterSamlSettings = () => {
  getSamlCertificate().then(certificate => {
    typeAndBlurUsingLabel("SAML Identity Provider URL", "https://example.test");
    typeAndBlurUsingLabel("SAML Identity Provider Certificate", certificate);
  });
};
