import { onlyOn } from "@cypress/skip-test";

import {
  restore,
  popover,
  appBar,
  navigationSidebar,
  openNativeEditor,
  openCollectionMenu,
  openCollectionItemMenu,
  modal,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";
import { displaySidebarChildOf } from "./helpers/e2e-collections-sidebar.js";

const PERMISSIONS = {
  curate: ["admin", "normal", "nodata"],
  view: ["readonly"],
  no: ["nocollection", "nosql", "none"],
};

test.describe("collection permissions", () => {
  test.beforeEach(async () => {
    restore();
  });

  test.describe("item management", () => {
    Object.entries(PERMISSIONS).forEach(([permission, userGroup]) => {
      test.describe(`${permission} access`, () => {
        userGroup.forEach(user => {
          onlyOn(permission === "curate", () => {
            test.describe(`${user} user`, () => {
              beforeEach(async () => {
                signIn(user);
              });

              test.describe("create dashboard", () => {
                test('should offer to save dashboard to a currently opened collection', async ({ page }) => {
                  await page.goto("/collection/root");
                  await navigationSidebar().within(() => {
                    displaySidebarChildOf("First collection");
                    await page.locator('text="Second collection"').click();
                  });
                  await appBar().within(() => {
                    await page.locator('icon="add"').click();
                  });
                  // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                  await page.locator('text="Dashboard"').click();
                  await page.locator('[data-testid="select-button"]').locator('text="Second collection"');
                });

                onlyOn(user === "admin", () => {
                  test('should offer to save dashboard to root collection from a dashboard page (metabase#16832)', async ({ page }) => {
                    await page.goto("/collection/root");
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await page.locator('text="Orders in a dashboard"').click();
                    await appBar().within(() => {
                      await page.locator('icon="add"').click();
                    });
                    await popover().findByText("Dashboard").click();
                    await page.locator('[data-testid="select-button"]').locator('text="Our analytics"');
                  });
                });
              });

              test.describe("pin", () => {
                test('pinning should work properly for both questions and dashboards', async ({ page }) => {
                  await page.goto("/collection/root");
                  // Assert that we're starting from a scenario with no pins
                  await expect(page.locator('[data-testid="pinned-items"]')).not.toBeVisible();

                  pinItem("Orders in a dashboard");
                  unpinnedItemsLeft(5);

                  pinItem("Orders, Count");
                  unpinnedItemsLeft(4);

                  // Should see "pinned items" and items should be in that section
                  await page.locator('[data-testid="pinned-items"]').within(() => {
                    await page.locator('text="Orders in a dashboard"');
                    await page.locator('text="Orders, Count"');
                  });
                });

                async function unpinnedItemsLeft(count) {
                  await expect(page.locator('[data-testid="collection-entry"]')).toHaveCount(count);
                }
              });

              test.describe("move", () => {
                test('should let a user move/undo move a question', async ({ page }) => {
                  move("Orders");
                });

                test('should let a user move/undo move a dashboard', async ({ page }) => {
                  move("Orders in a dashboard");
                });

                async function move(item) {
                  await page.goto("/collection/root");
                  openCollectionItemMenu(item);
                  await popover().within(() => {
                    await page.locator('text="Move"').click();
                  });
                  await page.locator('.Modal').within(() => {
                    await page.locator(`text="Move "${item}"?"`);
                    // Let's move it into a nested collection
                    await page.locator('text="First collection"')
                      .siblings("[data-testid='expand-btn']")
                      .click();
                    await page.locator('text="Second collection"').click();
                    await page.locator('text="Move"').click();
                  });
                  await expect(page.locator('text=item')).not.toBeVisible();
                  // Make sure item was properly moved to a correct sub-collection
                  exposeChildrenFor("First collection");
                  await page.locator('text="Second collection"').click();
                  await page.locator('text=item');
                  // Undo the whole thing
                  await page.locator('text=/Moved (question|dashboard)/');
                  await page.locator('text="Undo"').click();
                  await expect(page.locator('text=item')).not.toBeVisible();
                  await page.goto("/collection/root");
                  await page.locator('text=item');
                }
              });

              test.describe("duplicate", () => {
                test('should be able to duplicate the dashboard without obstructions from the modal (metabase#15256)', async ({ page }) => {
                  duplicate("Orders in a dashboard");
                });

                test.skip('should be able to duplicate the question (metabase#15255)', async ({ page }) => {
                  duplicate("Orders");
                });

                async function duplicate(item) {
                  await page.goto("/collection/root");
                  openCollectionItemMenu(item);
                  await page.locator('text="Duplicate"').click();
                  await page.locator('.Modal')
                    .as("modal")
                    .within(() => {
                      clickButton("Duplicate");
                      await expect(page.locator('text="Failed"')).not.toBeVisible();
                    });
                  await expect(page.locator('@modal')).not.toBeVisible();
                  await page.locator(`text="${item} - Duplicate"`);
                }
              });

              test.describe("archive", () => {
                test('should be able to archive/unarchive question (metabase#15253)', async ({ page }) => {
                  archiveUnarchive("Orders", "question");
                });

                test('should be able to archive/unarchive dashboard', async ({ page }) => {
                  archiveUnarchive("Orders in a dashboard", "dashboard");
                });

                test('should be able to archive/unarchive model', async ({ page }) => {
                  cy.skipOn(user === "nodata");
                  cy.createNativeQuestion({
                    name: "Model",
                    dataset: true,
                    native: {
                      query: "SELECT * FROM ORDERS",
                    },
                  });
                  archiveUnarchive("Model", "model");
                });

                describe("archive page", () => {
                  test('should show archived items (metabase#15080, metabase#16617)', async ({ page }) => {
                    await page.goto("collection/root");
                    openCollectionItemMenu("Orders");
                    await popover().within(() => {
                      await page.locator('text="Archive"').click();
                    });
                    await page.locator('[data-testid="toast-undo"]').within(() => {
                      await page.locator('text="Archived question"');
                      await page.locator('icon="close"').click();
                    });
                    await navigationSidebar().within(() => {
                      await page.locator('icon="ellipsis"').click();
                    });
                    await popover().findByText("View archive").click();
                    await page.locator('pathname').should("eq", "/archive");
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await page.locator('text="Orders"');
                  });
                });

                describe("collections", () => {
                  test("shouldn't be able to archive/edit root or personal collection", async ({ page }) => {
                    await page.goto("/collection/root");
                    await expect(page.locator('icon="edit"')).not.toBeVisible();
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await page.locator('text="Your personal collection"').click();
                    await expect(page.locator('icon="edit"')).not.toBeVisible();
                  });

                  test("archiving sub-collection should redirect to its parent", async ({ page }) => {
                    await page.request("GET", "/api/collection").then(xhr => {
                      // We need to obtain the ID programatically
                      const { id: THIRD_COLLECTION_ID } = xhr.body.find(
                        collection => collection.slug === "third_collection",
                      );

                      cy.intercept(
                        "PUT",
                        `/api/collection/${THIRD_COLLECTION_ID}`,
                      ).as("editCollection");

                      await page.goto(`/collection/${THIRD_COLLECTION_ID}`);
                    });

                    openCollectionMenu();
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await popover().within(() => cy.findByText("Archive").click());
                    await page.locator('.Modal').findByText("Archive").click();

                    await page.waitForResponse("@editCollection");

                    await page.locator('[data-testid="collection-name-heading"]')
                      .as("title")
                      .contains("Second collection");

                    await navigationSidebar().within(() => {
                      await page.locator('text="First collection"');
                      await page.locator('text="Second collection"');
                      await expect(page.locator('text="Third collection"')).not.toBeVisible();
                    });

                    // While we're here, we can test unarchiving the collection as well
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await page.locator('text="Archived collection"');
                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await page.locator('text="Undo"').click();

                    await page.waitForResponse("@editCollection");

                    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                    await expect(page.locator('text="Sorry, you don’t have permission to see that."')).not.toBeVisible();

                    // We're still in the parent collection
                    await page.locator('@title').contains("Second collection");

                    // But unarchived collection is now visible in the sidebar
                    await navigationSidebar().within(() => {
                      await page.locator('text="Third collection"');
                    });
                  });

                  test("visiting already archived collection by its ID shouldn't let you edit it (metabase#12489)", async ({ page }) => {
                    await page.request("GET", "/api/collection").then(xhr => {
                      const { id: THIRD_COLLECTION_ID } = xhr.body.find(
                        collection => collection.slug === "third_collection",
                      );
                      // Archive it
                      await page.request(
                        "PUT",
                        `/api/collection/${THIRD_COLLECTION_ID}`,
                        {
                          archived: true,
                        },
                      );

                      // What happens if we visit the archived collection by its id?
                      // This is the equivalent of hitting the back button but it also shows that the same UI is present whenever we visit the collection by its id
                      await page.goto(`/collection/${THIRD_COLLECTION_ID}`);
                    });
                    await page.locator('[data-testid="collection-name-heading"]')
                      .as("title")
                      .contains("Third collection");
                    // Creating new sub-collection at this point shouldn't be possible
                    await page.locator('[data-testid="collection-menu"]').within(() => {
                      await expect(page.locator('icon="add"')).not.toBeVisible();
                    });
                    // We shouldn't be able to change permissions for an archived collection (the root issue of #12489!)
                    await expect(page.locator('icon="lock"')).not.toBeVisible();
                    /**
                     *  We can take 2 routes from here - it will really depend on the design decision:
                     *    1. Edit icon shouldn't exist at all in which case some other call to drill-through menu/button should exist
                     *       notifying the user that this collection is archived and prompting them to unarchive it
                     *    2. Edit icon stays but with "Unarchive this item" ONLY in the menu
                     */

                    // Option 1
                    await expect(page.locator('icon="edit"')).not.toBeVisible();

                    // Option 2
                    // await page.locator('icon="edit"').click();
                    // await popover().within(() => {
                    //   await expect(page.locator('text="Edit this collection"')).not.toBeVisible();
                    //   await expect(page.locator('text="Archive this collection"')).not.toBeVisible();
                    //   await page.locator('text="Unarchive this collection"');
                    // });
                  });

                  test("abandoning archive process should keep you in the same collection (metabase#15289)", async ({ page }) => {
                    await page.request("GET", "/api/collection").then(xhr => {
                      const { id: THIRD_COLLECTION_ID } = xhr.body.find(
                        collection => collection.slug === "third_collection",
                      );
                      await page.goto(`/collection/${THIRD_COLLECTION_ID}`);
                      openCollectionMenu();
                      await popover().within(() => cy.findByText("Archive").click());
                      await page.locator('.Modal').findByText("Cancel").click();
                      await page.locator('pathname').should(
                        "eq",
                        `/collection/${THIRD_COLLECTION_ID}-third-collection`,
                      );
                      await page.locator('[data-testid="collection-name-heading"]')
                        .as("title")
                        .contains("Third collection");
                    });
                  });
                });

                async function archiveUnarchive(item, expectedEntityName) {
                  await page.goto("/collection/root");
                  openCollectionItemMenu(item);
                  await popover().within(() => {
                    await page.locator('text="Archive"').click();
                  });
                  await expect(page.locator('text=item')).not.toBeVisible();
                  await page.locator(`text="Archived ${expectedEntityName}"`);
                  await page.locator('text="Undo"').click();
                  await expect(page.locator('text="Sorry, you don’t have permission to see that."')).not.toBeVisible();
                  await page.locator('text=item');
                }
              });
            });
          });

          onlyOn(permission === "view", () => {
            beforeEach(async () => {
              signIn(user);
            });

            test("should not show pins or a helper text (metabase#20043)", async ({ page }) => {
              await page.goto("/collection/root");

              // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
              await page.locator('text="Orders in a dashboard"');
              await expect(page.locator('icon="pin"')).not.toBeVisible();
            });

            test("should be offered to duplicate dashboard in collections they have `read` access to", async ({ page }) => {
              const { first_name, last_name } = USERS[user];
              await page.goto("/collection/root");
              openCollectionItemMenu("Orders in a dashboard");
              await page.locator('text="Duplicate"').click();
              await page.locator('[data-testid="select-button"]').locator(`text="${first_name} ${last_name}'s Personal Collection"`);
            });

            test("should not be able to use bulk actions on collection items (metabase#16490)", async ({ page }) => {
              await page.goto("/collection/root");

              // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
              await page.locator('text="Orders"')
                .closest("tr")
                .within(() => {
                  await page.locator('icon="table"').hover();
                  await expect(page.locator('[role="checkbox"]')).not.toBeVisible();
                });

              // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
              await page.locator('text="Orders in a dashboard"')
                .closest("tr")
                .within(() => {
                  await page.locator('icon="dashboard"').hover();
                  await expect(page.locator('[role="checkbox"]')).not.toBeVisible();
                });
            });

            ["/", "/collection/root"].forEach(route => {
              test("should not be offered to save dashboard in collections they have `read` access to (metabase#15281)", async ({ page }) => {
                const { first_name, last_name } = USERS[user];
                await page.goto(route);
                await page.locator('icon="add"').click();
                // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
                await page.locator('text="Dashboard"').click();

                // Coming from the root collection, the initial offered collection will be "Our analytics" (read-only access)
                await modal().within(() => {
                  await page.locator(`text="${first_name} ${last_name}'s Personal Collection"`).click();
                });

                await popover().within(() => {
                  await page.locator('text="My personal collection"');
                  // Test will fail on this step first
                  await expect(page.locator('text="First collection"')).not.toBeVisible();
                  // This is the second step that makes sure not even search returns collections with read-only access
                  await page.locator('icon="search"').click();
                  await page.locator('[placeholder="Search"]')
                    .click()
                    .type("third{Enter}");
                  await expect(page.locator('text="Third collection"')).not.toBeVisible();
                });
              });
            });
          });
        });
      });
    });
  });

  test("should offer to save items to 'Our analytics' if user has a 'curate' access to it", async ({ page }) => {
    signIn("normal");

    openNativeEditor().type("select * from people");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Save"').click();

    await page.locator('[data-testid="select-button"]').locator('text="Our analytics"');
  });
});

async function clickButton(name) {
  await page.locator(`[role="button"][name="${name}"]`).shouldBeEnabled().click();
}

function pinItem(item) {
  openCollectionItemMenu(item);
  popover().icon("pin").click();
}

function exposeChildrenFor(collectionName) {
  navigationSidebar()
    .findByText(collectionName)
    .parentsUntil("[data-testid=sidebar-collection-link-root]")
    .find(".Icon-chevronright")
    .eq(0) // there may be more nested icons, but we need the top level one
    .click();
}
