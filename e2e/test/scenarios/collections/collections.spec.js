import { assocIn } from "icepick";
import _ from "underscore";
import {
  restore,
  modal,
  popover,
  openOrdersTable,
  navigationSidebar,
  getCollectionIdFromSlug,
  openNavigationSidebar,
  closeNavigationSidebar,
  openCollectionMenu,
  visitCollection,
  dragAndDrop,
  openUnpinnedItemMenu,
  getPinnedSection,
} from "e2e/support/helpers";
import { USERS, USER_GROUPS } from "e2e/support/cypress_data";
import { displaySidebarChildOf } from "./helpers/e2e-collections-sidebar.js";

const { nocollection } = USERS;
const { DATA_GROUP } = USER_GROUPS;

test.describe("scenarios > collection defaults", () => {
  beforeEach(async () => {
    restore();
    signInAsAdmin();
    test.intercept("GET", "/api/**/items?pinned_state*").as("getPinnedItems");
  });

  test.describe("new collection modal", () => {
    test('should be usable on small screens', async ({ page }) => {
      const COLLECTIONS_COUNT = 5;
      _.times(COLLECTIONS_COUNT, index => {
        cy.request("POST", "/api/collection", {
          name: `Collection ${index + 1}`,
          color: "#509EE3",
          parent_id: null,
        });
      });

      await page.goto("/");

      await page.setViewportSize({ width: 800, height: 500 });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.click('text="New"');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.click('text="Collection"');

      await page.locator('.Modal').within(async () => {
        await page.locator('input[aria-label="Name"]').fill("Test collection");
        await page.locator('input[aria-label="Description"]').fill("Test collection description");
        await page.click('text="Our analytics"');
      });

      await page.locator('.Popover').within(async () => {
        await page.click(`text="Collection ${COLLECTIONS_COUNT}"`);
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.click('text="Create"');

      await page.locator('[data-testid="collection-name-heading"]').should(
        "have.text",
        "Test collection",
      );
    });
  });

  // ... other tests
});

async function openEllipsisMenuFor(page, item) {
  await page.locator(`text="${item}"`)
    .closest("tr")
    .locator(".Icon-ellipsis")
    .click({ force: true });
}

async function selectItemUsingCheckbox(page, item, icon = "table") {
  await page.locator(`text="${item}"`)
    .closest("tr")
    .locator('input[role="checkbox"]').click();
}

async function visitRootCollection(page) {
  test.intercept("GET", "/api/collection/root/items?**").as(
    "fetchRootCollectionItems",
  );

  await page.goto("/collection/root");

  await page.waitForResponse("@fetchRootCollectionItems");
  await page.waitForResponse("@fetchRootCollectionItems");
}

async function ensureCollectionHasNoChildren(page, collection) {
  await page.locator(`text="${collection}"`)
    .closest("li")
    .within(async () => {
      // We used should.not.exist previously, but
      // this icon is now only hidden. It still exists in the DOM.
      await page.locator(".Icon-chevronright").should("be.hidden");
    });
}

async function ensureCollectionIsExpanded(page, collection, { children = [] } = {}) {
  await page.locator(`text="${collection}"`)
    .closest("[data-testid=sidebar-collection-link-root]")
    .as("root")
    .within(async () => {
      await page.locator(".Icon-chevronright").should("not.be.hidden");
    });

  if (children && children.length > 0) {
    await page.locator("@root")
      .next("ul")
      .within(async () => {
        children.forEach(async (child) => {
          await page.locator(`text="${child}"`);
        });
      });
  }
}

async function moveOpenedCollectionTo(page, newParent) {
  await openCollectionMenu(page);
  await page.locator('.Popover').within(async () => await page.click('text="Move"'));

  await page.locator('[data-testid="item-picker-item"]').locator(`text="${newParent}"`).click();

  await page.locator('.Modal').within(async () => {
    await page.locator('button:text("Move")').click();
  });
  // Make sure modal closed
  await page.locator('.Modal').should("not.exist");
}

async function moveItemToCollection(itemName, collectionName) {
  await cy.request("GET", "/api/collection/root/items").then(async (resp) => {
    const ALL_ITEMS = resp.body.data;

    const { id, model } = getCollectionItem(ALL_ITEMS, itemName);
    const { id: collection_id } = getCollectionItem(ALL_ITEMS, collectionName);

    await cy.request("PUT", `/api/${model}/${id}`, {
      collection_id,
    });
  });

  function getCollectionItem(collection, itemName) {
    return collection.find(item => item.name === itemName);
  }
}
