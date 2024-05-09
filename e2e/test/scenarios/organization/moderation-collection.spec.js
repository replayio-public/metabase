import {
  restore,
  modal,
  describeEE,
  isOSS,
  openNewCollectionItemFlowFor,
  appBar,
  navigationSidebar,
  closeNavigationSidebar,
  getCollectionActions,
  popover,
  openCollectionMenu,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const COLLECTION_NAME = "Official Collection Test";

const TEST_QUESTION_QUERY = {
  "source-table": ORDERS_ID,
  aggregation: [["count"]],
  breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "hour-of-day" }]],
};

describeEE("collections types", test.describe('collections types', () => {
  test.beforeEach(async () => {
    restore();
  });

  test('should be able to manage collection authority level', async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/collection/root");

    await createAndOpenOfficialCollection({ name: COLLECTION_NAME, page });
    await page.locator('[data-testid="official-collection-marker"]');
    await assertSidebarIcon(COLLECTION_NAME, "badge", page);

    await changeCollectionTypeTo("regular", page);
    await page.locator('[data-testid="official-collection-marker"]').should("not.exist");
    await assertSidebarIcon(COLLECTION_NAME, "folder", page);

    await changeCollectionTypeTo("official", page);
    await page.locator('[data-testid="official-collection-marker"]');
    await assertSidebarIcon(COLLECTION_NAME, "badge", page);
  });

  test('displays official badge throughout the application', async ({ page }) => {
    await signInAsAdmin(page);
    await testOfficialBadgePresence(page);
  });

  test('should display a badge next to official questions in regular dashboards', async ({ page }) => {
    await signInAsAdmin(page);
    await testOfficialQuestionBadgeInRegularDashboard(page);
  });

  test('should not see collection type field if not admin', async ({ page }) => {
    await signIn("normal", page);
    await page.goto("/collection/root");

    await openCollection("First collection", page);

    await openNewCollectionItemFlowFor("collection", page);
    await modal().within(() => {
      assertNoCollectionTypeInput(page);
      cy.icon("close").click();
    });

    await openCollectionMenu(page);
    await popover().within(() => {
      assertNoCollectionTypeOption(page);
    });
  });

  test('should not be able to manage collection authority level for personal collections and their children', async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/collection/root");

    await openCollection("Your personal collection", page);
    await getCollectionActions().within(() => {
      cy.icon("ellipsis").should("not.exist");
    });

    await openNewCollectionItemFlowFor("collection", page);
    await modal().within(() => {
      assertNoCollectionTypeInput(page);
      cy.findByLabelText("Name").type("Personal collection child");
      cy.button("Create").click();
    });

    await openCollection("Personal collection child", page);

    await openNewCollectionItemFlowFor("collection", page);
    await modal().within(() => {
      assertNoCollectionTypeInput(page);
      cy.icon("close").click();
    });
  });
}););

test.describe('collection types', { tags: "@OSS" }, () => {
  test.beforeEach(async () => {
    cy.onlyOn(isOSS);

    restore();
    await signInAsAdmin(page);
  });

  test('should not be able to manage collection\'s authority level', async ({ page }) => {
    await page.goto("/collection/root");

    await openNewCollectionItemFlowFor("collection", page);
    await modal().within(() => {
      assertNoCollectionTypeInput(page);
      cy.icon("close").click();
    });

    await openCollection("First collection", page);
    await openCollectionMenu(page);
    assertNoCollectionTypeOption(page);
  });

  test('should not display official collection icon', async ({ page }) => {
    await testOfficialBadgePresence(false, page);
  });

  test('should display official questions as regular in regular dashboards', async ({ page }) => {
    await testOfficialQuestionBadgeInRegularDashboard(false, page);
  });
});

async function testOfficialBadgePresence(page, expectBadge = true) {
  await createCollection({
    name: COLLECTION_NAME,
    authority_level: "official",
    page,
  }).then(response => {
    const { id: collectionId } = response.body;
    await createQuestion({
      name: "Official Question",
      collection_id: collectionId,
      query: TEST_QUESTION_QUERY,
      page,
    });
    await createDashboard({
      name: "Official Dashboard",
      collection_id: collectionId,
      page,
    });
    await page.goto(`/collection/${collectionId}`);
  });

  // Dashboard Page
  await page.locator("text=Official Dashboard").click();
  await assertHasCollectionBadgeInNavbar(expectBadge, page);

  // Question Page
  await page.locator("header").locator("text=COLLECTION_NAME").click();
  await page.locator("text=Official Question").click();
  await assertHasCollectionBadgeInNavbar(expectBadge, page);

  // Search
  await testOfficialBadgeInSearch({
    searchQuery: "Official",
    collection: COLLECTION_NAME,
    dashboard: "Official Dashboard",
    question: "Official Question",
    expectBadge,
    page,
  });
}

// The helper accepts a single search query,
// and relies on collection, dashboard and question being found within this single query
async function testOfficialBadgeInSearch({
  searchQuery,
  collection,
  dashboard,
  question,
  expectBadge,
  page,
}) {
  await appBar().locator('placeholder="Search…"').as("searchBar").type(searchQuery);

  await page.locator('[data-testid="search-results-list"]').within(() => {
    assertSearchResultBadge(collection, {
      expectBadge,
      selector: "h3",
      page,
    });
    assertSearchResultBadge(question, { expectBadge, page });
    assertSearchResultBadge(dashboard, { expectBadge, page });
  });
}

async function testOfficialQuestionBadgeInRegularDashboard(page, expectBadge = true) {
  await createCollection({
    name: COLLECTION_NAME,
    authority_level: "official",
    page,
  }).then(response => {
    const { id: collectionId } = response.body;
    await createQuestionAndDashboard({
      questionDetails: {
        name: "Official Question",
        collection_id: collectionId,
        query: TEST_QUESTION_QUERY,
        page,
      },
      dashboardDetails: { name: "Regular Dashboard", page },
    });
  });

  await page.goto("/collection/root");
  await page.locator("text=Regular Dashboard").click();

  await page.locator(".DashboardGrid").within(() => {
    await page.locator("icon=badge").should(expectBadge ? "exist" : "not.exist");
  });
}

function openCollection(collectionName) {
  navigationSidebar().findByText(collectionName).click();
}

async function createAndOpenOfficialCollection({ name, page }) {
  await openNewCollectionItemFlowFor("collection", page);
  await modal().within(() => {
    await page.locator('label="Name"').type(name);
    await page.locator("text=Official").click();
    await page.locator("button=Create").click();
  });
  await navigationSidebar(page).within(() => {
    await page.locator("text=name").click();
  });
}

async function changeCollectionTypeTo(type, page) {
  await openCollectionMenu(page);
  await popover().within(() => {
    if (type === "official") {
      await page.locator("text=Make collection official").click();
    } else {
      await page.locator("text=Remove Official badge").click();
    }
  });
}

async function assertNoCollectionTypeInput(page) {
  await page.locator("text=/Collection type/i").should("not.exist");
  await page.locator("text=Regular").should("not.exist");
  await page.locator("text=Official").should("not.exist");
}

async function assertNoCollectionTypeOption(page) {
  await page.locator("text=Make collection official").should("not.exist");
  await page.locator("text=Remove Official badge").should("not.exist");
}

async function assertSidebarIcon(collectionName, expectedIcon, page) {
  await navigationSidebar(page)
    .locator("text=collectionName")
    .parent()
    .within(() => {
      await page.locator("icon=expectedIcon");
    });
}

async function assertSearchResultBadge(itemName, opts, page) {
  const { expectBadge } = opts;
  await page.locator("text=itemName", opts)
    .parentsUntil("[data-testid=search-result-item]")
    .last()
    .within(() => {
      await page.locator("icon=badge").should(expectBadge ? "exist" : "not.exist");
    });
}

const assertHasCollectionBadgeInNavbar = async (page, expectBadge = true) => {
  await closeNavigationSidebar(page);
  await page.locator("header")
    .locator("text=COLLECTION_NAME")
    .parent()
    .within(() => {
      await page.locator("icon=badge").should(expectBadge ? "exist" : "not.exist");
      if (expectBadge) {
        await page.locator("icon=badge").should("be.visible");
      }
    });
};
