import { restore, popover, describeEE } from "e2e/support/helpers";
import { SAMPLE_DB_ID, USER_GROUPS } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;

describeEE("issue 17763", test.describe('issue 17763', () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.updatePermissionsGraph({
      [ALL_USERS_GROUP]: {
        1: { data: { schemas: "block", native: "none" } },
      },
    });
  });

  test('should be able to edit tables permissions in granular view after "block" permissions (metabase#17763)', async ({ page }) => {
    await page.goto(`/admin/permissions/data/database/${SAMPLE_DB_ID}`);

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Block"');

    await popover().contains("Granular").click();

    await expect(page.locator("pathname")).toEqual(
      `/admin/permissions/data/group/${ALL_USERS_GROUP}/database/${SAMPLE_DB_ID}`,
    );

    await page.locator('[data-testid="permission-table"]').within(() => {
      page.locator('text="No self-service"').first().click();
    });

    await popover().within(() => {
      page.locator('text="Unrestricted"');
      page.locator('text="Sandboxed"');
    });
  });
});
