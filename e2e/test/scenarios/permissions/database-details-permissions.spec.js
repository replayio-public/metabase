import {
  restore,
  modal,
  describeEE,
  assertPermissionForItem,
  modifyPermission,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const DATA_ACCESS_PERMISSION_INDEX = 0;
const DETAILS_PERMISSION_INDEX = 4;

describeEE(
  "scenarios > admin > permissions > database details permissions",
  test.describe("permissions > database details permissions", () => {
    test.beforeEach(async () => {
      restore();
      await cy.signInAsAdmin();
    });

    test("allows database managers to see and edit database details but not to delete a database (metabase#22293)", async () => {
      // As an admin, grant database details permissions to all users
      await cy.visit(`/admin/permissions/data/database/${SAMPLE_DB_ID}`);

      modifyPermission(
        "All Users",
        DATA_ACCESS_PERMISSION_INDEX,
        "Unrestricted",
      );
      modifyPermission("All Users", DETAILS_PERMISSION_INDEX, "Yes");

      await cy.button("Save changes").click();

      modal().within(() => {
        cy.findByText("Save permissions?");
        cy.findByText("Are you sure you want to do this?");
        cy.button("Yes").click();
      });

      assertPermissionForItem("All Users", DETAILS_PERMISSION_INDEX, "Yes");

      // Normal user should now have the ability to manage databases
      await cy.signInAsNormalUser();

      await cy.visit("/");
      await cy.icon("gear").click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await cy.findByText("Admin settings").should("be.visible").click();

      await cy.location("pathname").should("eq", "/admin/databases");

      await cy.get("nav")
        .should("contain", "Databases")
        .and("not.contain", "Settings")
        .and("not.contain", "Data Model");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await cy.findByText("Sample Database").click();

      await cy.findByTestId("database-actions-panel")
        .should("contain", "Sync database schema now")
        .and("contain", "Re-scan field values now")
        .and("contain", "Discard saved field values")
        .and("not.contain", "Remove this database");

      await cy.request({
        method: "DELETE",
        url: `/api/database/${SAMPLE_DB_ID}`,
        failOnStatusCode: false,
      }).then(({ status }) => {
        expect(status).to.eq(403);
      });
    });
  }),
);
