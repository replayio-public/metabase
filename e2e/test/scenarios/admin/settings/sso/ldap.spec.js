import {
  modal,
  popover,
  restore,
  setupLdap,
  typeAndBlurUsingLabel,
} from "e2e/support/helpers";

import {
  crudGroupMappingsWidget,
  checkGroupConsistencyAfterDeletingMappings,
} from "./group-mappings-widget";

test.describe(
  "scenarios > admin > settings > SSO > LDAP",
  () => {
    test.beforeEach(async () => {
      restore();
      cy.signInAsAdmin();
      cy.intercept("PUT", "/api/setting").as("updateSettings");
      cy.intercept("PUT", "/api/setting/*").as("updateSetting");
      cy.intercept("PUT", "/api/ldap/settings").as("updateLdapSettings");
    });

    test("should setup ldap (metabase#16173)", async () => {
      cy.visit("/admin/settings/authentication/ldap");

      enterLdapSettings();
      cy.button("Save and enable").click();
      cy.wait("@updateLdapSettings");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Success").should("exist");
    });

    test("should update ldap settings", async () => {
      setupLdap();
      cy.visit("/admin/settings/authentication/ldap");

      enterLdapPort("389");
      cy.button("Save changes").click();
      cy.wait("@updateLdapSettings");

      cy.findAllByRole("link", { name: "Authentication" }).first().click();
      getLdapCard().findByText("Active").should("exist");
    });

    test("should allow to disable and enable ldap", async () => {
      setupLdap();
      cy.visit("/admin/settings/authentication");

      getLdapCard().icon("ellipsis").click();
      popover().findByText("Pause").click();
      cy.wait("@updateSetting");
      getLdapCard().findByText("Paused").should("exist");

      getLdapCard().icon("ellipsis").click();
      popover().findByText("Resume").click();
      cy.wait("@updateSetting");
      getLdapCard().findByText("Active").should("exist");
    });

    test("should allow to reset ldap settings", async () => {
      setupLdap();
      cy.visit("/admin/settings/authentication");

      getLdapCard().icon("ellipsis").click();
      popover().findByText("Deactivate").click();
      modal().button("Deactivate").click();
      cy.wait("@updateSettings");

      getLdapCard().findByText("Set up").should("exist");
    });

    test("should not reset previously populated fields when validation fails for just one of them (metabase#16226)", async () => {
      cy.visit("/admin/settings/authentication/ldap");

      enterLdapSettings();
      enterLdapPort("0");
      cy.button("Save and enable").click();
      cy.wait("@updateLdapSettings");

      cy.findAllByText("Wrong host or port").should("exist");
      cy.findByDisplayValue("localhost").should("exist");
    });

    test("shouldn't be possible to save a non-numeric port (#13313)", async () => {
      cy.visit("/admin/settings/authentication/ldap");

      enterLdapSettings();
      enterLdapPort("asd");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("That's not a valid port number").should("exist");

      enterLdapPort("21.3");
      cy.button("Save and enable").click();
      cy.wait("@updateLdapSettings");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText('For input string: "21.3"').should("exist");

      enterLdapPort("123 ");
      cy.button("Save failed").click();
      cy.wait("@updateLdapSettings");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText('For input string: "123 "').should("exist");
    });

    test("should show the login form when ldap is enabled but password login isn't (metabase#25661)", async () => {
      setupLdap();
      cy.request("PUT", "/api/setting/enable-password-login", { value: false });
      cy.signOut();
      cy.visit("/auth/login");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Username or email address").should("be.visible");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Password").should("be.visible");
    });

    test.describe("Group Mappings Widget", () => {
      test.beforeEach(async () => {
        cy.intercept("GET", "/api/setting").as("getSettings");
        cy.intercept("GET", "/api/session/properties").as(
          "getSessionProperties",
        );
        cy.intercept("DELETE", "/api/permissions/group/*").as("deleteGroup");
        cy.intercept("PUT", "/api/permissions/membership/*/clear").as(
          "clearGroup",
        );
      });

      test("should allow deleting mappings along with deleting, or clearing users of, mapped groups", async () => {
        crudGroupMappingsWidget("ldap");
      });

      test("should allow deleting mappings with groups, while keeping remaining mappings consistent with their undeleted groups", async () => {
        checkGroupConsistencyAfterDeletingMappings("ldap");
      });
    });
  },
);

const getLdapCard = () => {
  return cy.findByText("LDAP").parent().parent();
};

const enterLdapPort = value => {
  typeAndBlurUsingLabel("LDAP Port", value);
};

const enterLdapSettings = () => {
  typeAndBlurUsingLabel("LDAP Host", "localhost");
  typeAndBlurUsingLabel("LDAP Port", "389");
  typeAndBlurUsingLabel("Username or DN", "cn=admin,dc=example,dc=org");
  typeAndBlurUsingLabel("Password", "admin");
  typeAndBlurUsingLabel("User search base", "dc=example,dc=org");
};
