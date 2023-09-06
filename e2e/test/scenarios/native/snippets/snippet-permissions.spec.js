import {
  restore,
  modal,
  popover,
  describeEE,
  openNativeEditor,
  rightSidebar,
} from "e2e/support/helpers";

import { USER_GROUPS } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;

describeEE("scenarios > question > snippets", (() => {
  test.beforeEach(async () => {
    restore();
  });

  ["admin", "normal"].forEach(user => {
    test(`${user} user can create a snippet (metabase#21581)`, async ({ page }) => {
      await page.route("POST", "/api/native-query-snippet");

      await signIn(user);

      openNativeEditor();
      await page.locator('.Icon-snippet').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=Create a snippet').click();

      await modal().within(async () => {
        await page.locator('input[aria-label="Enter some SQL here so you can reuse it later"]').fill("SELECT 1");
        await page.locator('input[aria-label="Give your snippet a name"]').fill("one");
        await page.locator('button:text("Save")').click();
      });

      await page.waitForResponse("POST", "/api/native-query-snippet");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text={{snippet: one}}');

      await page.locator('.Icon-play').first().click();
      await page.locator('.ScalarValue').toHaveText("1");
    });
  });

  test("should let you create a snippet folder and move a snippet into it", async ({ page }) => {
    await signInAsAdmin();
    // create snippet via API
    await page.request("POST", "/api/native-query-snippet", {
      content: "snippet 1",
      name: "snippet 1",
      collection_id: null,
    });

    await page.route("GET", "api/collection/*");

    openNativeEditor();

    // create folder
    await page.locator('.Icon-snippet').click();
    await page.locator('[data-testid="sidebar-right"]').as("sidebar").locator('.Icon-add').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await popover().within(async () => await page.locator('text=New folder').click());
    await modal().within(async () => {
      await page.locator('text=Create your new folder');
      await page.locator('input[aria-label="Give your folder a name"]').fill("my favorite snippets");
      await page.locator('button:text("Create")').click();
    });

    // move snippet into folder
    await page.locator('@sidebar')
      .locator('text=snippet 1')
      .parent()
      .parent()
      .parent()
      .within(async () => {
        await page.locator('.Icon-chevrondown').click({ force: true });
      });

    await rightSidebar().within(async () => {
      await page.locator('button:text("Edit")').click();
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await modal().within(async () => await page.locator('text=Top folder').click());
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await popover().within(async () => await page.locator('text=my favorite snippets').click());
    await page.route("/api/collection/root/items?namespace=snippets");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await modal().within(async () => await page.locator('button:text("Save")').click());

    // check that everything is in the right spot
    await page.waitForResponse("/api/collection/root/items?namespace=snippets");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=snippet 1').should("not.exist");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=my favorite snippets').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text=snippet 1');
  });

  test.describe("existing snippet folder", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("GET", "/api/collection/root");

      await signInAsAdmin();

      await page.request("POST", "/api/collection", {
        name: "Snippet Folder",
        description: null,
        color: "#509EE3",
        parent_id: null,
        namespace: "snippets",
      });
    });

    test("should not display snippet folder as part of collections (metabase#14907)", async ({ page }) => {
      await page.goto("/collection/root");

      await page.waitForResponse("@collections");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=Snippet Folder').should("not.exist");
    });

    test("shouldn't update root permissions when changing permissions on a created folder (metabase#17268)", async ({ page }) => {
      await page.route("PUT", "/api/collection/graph");

      openNativeEditor();
      await page.locator('.Icon-snippet').click();

      // Edit permissions for a snippet folder
      await page.locator('[data-testid="sidebar-right"]').within(async () => {
        await page.locator('text=Snippet Folder')
          .next()
          .locator('.Icon-ellipsis')
          .click({ force: true });
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('button:text("Change permissions")').click();

      // Update permissions for "All users" and let them only "View" this folder
      await modal().within(async () => {
        await getPermissionsForUserGroup("All Users")
          .should("contain", "Curate")
          .click();
      });

      await popover().contains("View").click();
      await page.locator('button:text("Save")').click();

      await page.waitForResponse("PUT", "/api/collection/graph");

      // Now let's do the sanity check for the top level (root) snippet permissions and make sure nothing changed there
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=Snippets').parent().next().locator('.Icon-ellipsis').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('button:text("Change permissions")').click();

      // UI check
      await modal().within(async () => {
        await getPermissionsForUserGroup("All Users").should("contain", "Curate");
      });

      // API check
      await page.waitForResponse("@updatePermissions").then(intercept => {
        const { groups } = intercept.response.body;
        const allUsers = groups[ALL_USERS_GROUP];

        expect(allUsers.root).to.equal("write");
      });
    });
  });
});

async function getPermissionsForUserGroup(userGroup) {
  return await page
    .locator(`text=${userGroup}`)
    .closest("tr")
    .locator('[data-testid="permissions-select"]');
}
