import { restore, describeEE } from "e2e/support/helpers";
import { USER_GROUPS, SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP, DATA_GROUP } = USER_GROUPS;

describeEE("issue 22695 ", (() => {
  test.beforeEach(async ({ page }) => {
    cy.intercept("GET", "/api/search?*").as("searchResults");

    restore();
    cy.signInAsAdmin();

    cy.updatePermissionsGraph({
      [ALL_USERS_GROUP]: {
        [SAMPLE_DB_ID]: { data: { schemas: "block" } },
      },
      [DATA_GROUP]: {
        [SAMPLE_DB_ID]: { data: { schemas: "block" } },
      },
    });
  });

  // https://github.com/metabase/metaboat/issues/159
  test("should not expose database names to which the user has no access permissions (metabase#22695)", async ({ page }) => {
    // Nocollection user belongs to a "data" group which we blocked for this repro,
    // but they have access to data otherwise (as name suggests)
    cy.signIn("nocollection");
    assert();

    cy.signOut();

    // Nodata user belongs to the group that has access to collections,
    // but has no-self-service data permissions
    cy.signIn("nodata");
    assert();
  });
}));

async function assert() {
  await page.goto("/");

  await page.locator('input[placeholder="Search…"]').click().type("S");
  await page.waitForResponse("/api/search?*");

  const searchResults = await page.locators('[data-testid="search-result-item-name"]');
  expect(searchResults).toHaveLengthGreaterThan(0);
  for (const result of searchResults) {
    expect(await result.textContent()).not.toContain("Sample Database");
  }
}
