import {
  getCollectionIdFromSlug,
  restore,
  popover,
  navigationSidebar,
  visitCollection,
} from "e2e/support/helpers";
import { USERS, SAMPLE_DB_TABLES } from "e2e/support/cypress_data";

import { getSidebarSectionTitle as getSectionTitle } from "e2e/support/helpers/e2e-collection-helpers";

const adminFullName = USERS.admin.first_name + " " + USERS.admin.last_name;
const adminPersonalCollectionName = adminFullName + "'s Personal Collection";

const { STATIC_ORDERS_ID } = SAMPLE_DB_TABLES;

test.describe("scenarios > organization > bookmarks > collection", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test("cannot add bookmark to root collection", async ({ page }) => {
    cy.intercept("GET", "/api/collection/root/items?**").as(
      "fetchRootCollectionItems",
    );

    cy.visit("/collection/root");

    cy.wait("@fetchRootCollectionItems");

    getSectionTitle("Collections");
    cy.icon("bookmark").should("not.exist");
  });

  test("can add, update bookmark name when collection name is updated, and remove bookmarks from collection from its page", async ({ page }) => {
    getCollectionIdFromSlug("first_collection", id => {
      visitCollection(id);
    });

    // Add bookmark
    cy.icon("bookmark").click();

    navigationSidebar().within(() => {
      getSectionTitle(/Bookmarks/);
      cy.findAllByText("First collection").should("have.length", 2);

      // Once there is a list of bookmarks,
      // we add a heading to the list of collections below the list of bookmarks
      getSectionTitle("Collections");
    });

    // Rename bookmarked collection
    cy.findByTestId("collection-name-heading").click().type(" 2").blur();

    navigationSidebar().within(() => {
      cy.findAllByText("First collection 2").should("have.length", 2);
    });

    // Remove bookmark
    cy.findByTestId("collection-menu").within(() => {
      cy.icon("bookmark").click();
    });

    navigationSidebar().within(() => {
      cy.findAllByText("First collection 2").should("have.length", 1);
    });
  });

  test("can add/remove bookmark from unpinned Question in collection", async ({ page }) => {
    addThenRemoveBookmarkTo("Orders");
  });

  test("can add/remove bookmark from pinned Question in collection", async ({ page }) => {
    const name = "Orders";
    cy.visit("/collection/root");

    pin(name);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText(/Rows/);
    bookmarkPinnedItem(name);
  });

  test("can add/remove bookmark from unpinned Dashboard in collection", async ({ page }) => {
    addThenRemoveBookmarkTo("Orders in a dashboard");
  });

  test("can add/remove bookmark from pinned Question in collection", async ({ page }) => {
    const name = "Orders in a dashboard";
    cy.visit("/collection/root");

    pin(name);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("A dashboard");
    bookmarkPinnedItem(name);
  });

  test("adds and removes bookmarks from Model in collection", async ({ page }) => {
    cy.createQuestion({
      name: "Orders Model",
      query: { "source-table": STATIC_ORDERS_ID, aggregation: [["count"]] },
      dataset: true,
    });

    addThenRemoveBookmarkTo("Orders Model");
  });

  test("removes items from bookmarks list when they are archived", async ({ page }) => {
    // A question
    bookmarkThenArchive("Orders");

    // A dashboard
    bookmarkThenArchive("Orders in a dashboard");
  });

  test("can remove bookmark from item in sidebar", async ({ page }) => {
    cy.visit("/collection/1");

    // Add bookmark
    cy.icon("bookmark").click();

    navigationSidebar().within(() => {
      cy.icon("bookmark").click({ force: true });
    });

    getSectionTitle(/Bookmarks/).should("not.exist");
  });

  test("can toggle bookmark list visibility", async ({ page }) => {
    cy.visit("/collection/1");

    // Add bookmark
    cy.icon("bookmark").click();

    navigationSidebar().within(() => {
      getSectionTitle(/Bookmarks/).click();

      cy.findByText(adminPersonalCollectionName).should("not.exist");

      getSectionTitle(/Bookmarks/).click();

      cy.findByText(adminPersonalCollectionName);
    });
  });
});

function addThenRemoveBookmarkTo(name) {
  addBookmarkTo(name);
  removeBookmarkFrom(name);
}

async function addBookmarkTo(name, { page }) {
  await page.goto("/collection/root");

  await openEllipsisMenuFor(name, { page });
  await page.click('text="Bookmark"');

  await navigationSidebar().within(() => {
    getSectionTitle(/Bookmarks/);
    page.locator(`text=${name}`);
  });
}

async function removeBookmarkFrom(name, { page }) {
  await openEllipsisMenuFor(name, { page });

  await page.click('text="Remove from bookmarks"');

  await navigationSidebar().within(() => {
    getSectionTitle(/Bookmarks/).should("not.exist");
    page.locator(`text=${name}`).should("not.exist");
  });
}

async function openEllipsisMenuFor(name, { page }) {
  await page.locator(`text=${name}`)
    .closest("tr")
    .locator(".Icon-ellipsis")
    .click({ force: true });
}

function bookmarkThenArchive(name) {
  addBookmarkTo(name);
  archive(name);
}

async function pin(name, { page }) {
  await openEllipsisMenuFor(name, { page });
  await popover().within(() => {
    page.click('text="Pin this"');
  });
}

async function archive(name, { page }) {
  await openEllipsisMenuFor(name, { page });
  await popover().within(() => {
    page.click('text="Archive"');
  });
}

async function bookmarkPinnedItem(name, { page }) {
  await page.locator(`text=${name}`)
    .closest("a")
    .locator(".Icon-ellipsis")
    .click({ force: true });

  await page.click('text="Bookmark"');

  await navigationSidebar().within(() => {
    getSectionTitle(/Bookmarks/);
    page.locator(`text=${name}`);
  });
}
