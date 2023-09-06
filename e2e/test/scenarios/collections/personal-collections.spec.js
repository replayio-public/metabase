import {
  restore,
  popover,
  modal,
  navigationSidebar,
  openNewCollectionItemFlowFor,
  getCollectionActions,
  openCollectionMenu,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const ADMIN_PERSONAL_COLLECTION_ID = 1;
const NODATA_PERSONAL_COLLECTION_ID = 5;

test.describe("personal collections", () => {
  test.beforeEach(async () => {
    restore();
  });

  test.describe("admin", () => {
    test.beforeEach(async () => {
      cy.signInAsAdmin();
    });

    test.skip("shouldn't get API response containing all other personal collections when visiting the home page (metabase#24330)", async ({ page }) => {
      const getCollections = await page.route("GET", "/api/collection/tree*");

      await page.goto("/");

      const { response: { body } } = await getCollections.waitFor();
      const personalCollections = body.filter(({ personal_owner_id }) => {
        return personal_owner_id !== null;
      });

      expect(personalCollections).toHaveLength(1);
    });

    test("should be able to view their own as well as other users' personal collections (including other admins)", async ({ page }) => {
      // Turn normal user into another admin
      cy.request("PUT", "/api/user/2", {
        is_superuser: true,
      });

      await page.goto("/collection/root");
      await page.locator('text="Your personal collection"');
      navigationSidebar().within(() => {
        cy.icon("ellipsis").click();
      });
      popover().findByText("Other users' personal collections").click();
      await page.locator('text=/All personal collections/i');
      Object.values(USERS).forEach(user => {
        const FULL_NAME = `${user.first_name} ${user.last_name}`;
        cy.findByText(FULL_NAME);
      });
    });

    // Other tests are skipped due to infinite loop and timeout issues in CI
    // Please see: https://github.com/metabase/metabase/issues/21026#issuecomment-1094114700
  });

  // Other test.describe blocks are not converted due to the usage of cy.signIn() and other Cypress-specific functions
});

async function addNewCollection(page, name) {
  await openNewCollectionItemFlowFor(page, "collection");
  await page.locator('input[aria-label="Name"]').fill(name);
  await page.locator('button:text("Create")').click();
}
