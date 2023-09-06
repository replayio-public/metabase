import _ from "underscore";
import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > collection items listing", () => {
  test.beforeEach(async ({ page }) => {
    cy.intercept("GET", "/api/collection/root/items?*").as(
      "getCollectionItems",
    );

    restore();
    cy.signInAsAdmin();
  });

  const TEST_QUESTION_QUERY = {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [
      ["field", ORDERS.CREATED_AT, { "temporal-unit": "hour-of-day" }],
    ],
  };

  const PAGE_SIZE = 25;

  test.describe("pagination", () => {
    const SUBCOLLECTIONS = 1;
    const ADDED_QUESTIONS = 15;
    const ADDED_DASHBOARDS = 14;

    const TOTAL_ITEMS = SUBCOLLECTIONS + ADDED_DASHBOARDS + ADDED_QUESTIONS;

    test.beforeEach(() => {
      // Removes questions and dashboards included in the default database,
      // so the test won't fail if we change the default database
      cy.request("GET", "/api/collection/root/items").then(response => {
        response.body.data.forEach(({ model, id }) => {
          if (model !== "collection") {
            cy.request("PUT", `/api/${model}/${id}`, {
              archived: true,
            });
          }
        });
      });

      _.times(ADDED_DASHBOARDS, i =>
        cy.createDashboard({ name: `dashboard ${i}` }),
      );
      _.times(ADDED_QUESTIONS, i =>
        cy.createQuestion({
          name: `generated question ${i}`,
          query: TEST_QUESTION_QUERY,
        }),
      );
    });

    test("should allow to navigate back and forth", async ({ page }) => {
      visitRootCollection();

      // First page
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText(`1 - ${PAGE_SIZE}`);
      cy.findByTestId("pagination-total").should("have.text", TOTAL_ITEMS);
      cy.findAllByTestId("collection-entry").should("have.length", PAGE_SIZE);

      await page.locator('[aria-label="Next page"]').click();
      cy.wait("@getCollectionItems");

      // Second page
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText(`${PAGE_SIZE + 1} - ${TOTAL_ITEMS}`);
      cy.findByTestId("pagination-total").should("have.text", TOTAL_ITEMS);
      cy.findAllByTestId("collection-entry").should(
        "have.length",
        TOTAL_ITEMS - PAGE_SIZE,
      );
      cy.findByLabelText("Next page").should("be.disabled");

      await page.locator('[aria-label="Previous page"]').click();

      // First page
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText(`1 - ${PAGE_SIZE}`);
      cy.findByTestId("pagination-total").should("have.text", TOTAL_ITEMS);
      cy.findAllByTestId("collection-entry").should("have.length", PAGE_SIZE);
    });
  });

  test.describe("sorting", () => {
    test.beforeEach(() => {
      // Removes questions and dashboards included in a default dataset,
      // so it's easier to test sorting
      cy.request("GET", "/api/collection/root/items").then(response => {
        response.body.data.forEach(({ model, id }) => {
          if (model !== "collection") {
            cy.request("PUT", `/api/${model}/${id}`, {
              archived: true,
            });
          }
        });
      });
    });

    test("should allow to sort unpinned items by columns asc and desc", async ({ page }) => {
      ["A", "B", "C"].forEach((letter, i) => {
        cy.createDashboard({
          name: `${letter} Dashboard`,
          collection_position: null,
        });

        // Signing in as a different users, so we have different names in "Last edited by"
        // In that way we can test sorting by this column correctly
        cy.signIn("normal");

        cy.createQuestion({
          name: `${letter} Question`,
          collection_position: null,
          query: TEST_QUESTION_QUERY,
        });
      });

      visitRootCollection();

      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        expect(actualNames, "sorted alphabetically by default").to.deep.equal(
          sortedNames,
        );
      });

      toggleSortingFor(/Name/i);
      cy.wait("@getCollectionItems");

      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        expect(actualNames, "sorted alphabetically reversed").to.deep.equal(
          sortedNames.reverse(),
        );
      });

      toggleSortingFor(/Name/i);
      // Not sure why the same XHR doesn't happen after we click the "Name" sorting again?
      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        expect(actualNames, "sorted alphabetically").to.deep.equal(sortedNames);
      });

      toggleSortingFor(/Type/i);
      cy.wait("@getCollectionItems");
      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        const dashboardsFirst = _.chain(sortedNames)
          .sortBy(name => name.toLowerCase().includes("question"))
          .sortBy(name => name.toLowerCase().includes("collection"))
          .value();
        expect(actualNames, "sorted dashboards first").to.deep.equal(
          dashboardsFirst,
        );
      });

      toggleSortingFor(/Type/i);
      cy.wait("@getCollectionItems");
      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        const questionsFirst = _.chain(sortedNames)
          .sortBy(name => name.toLowerCase().includes("question"))
          .sortBy(name => name.toLowerCase().includes("dashboard"))
          .value();
        expect(actualNames, "sorted questions first").to.deep.equal(
          questionsFirst,
        );
      });

      const lastEditedByColumnTestId = "collection-entry-last-edited-by";

      toggleSortingFor(/Last edited by/i);
      cy.wait("@getCollectionItems");

      cy.findAllByTestId(lastEditedByColumnTestId).then(nodes => {
        const actualNames = _.map(nodes, "innerText");
        const sortedNames = _.chain(actualNames)
          .sortBy(actualNames)
          .sortBy(name => !name)
          .value();
        expect(
          actualNames,
          "sorted by last editor name alphabetically",
        ).to.deep.equal(sortedNames);
      });

      toggleSortingFor(/Last edited by/i);
      cy.wait("@getCollectionItems");

      cy.findAllByTestId(lastEditedByColumnTestId).then(nodes => {
        const actualNames = _.map(nodes, "innerText");
        const sortedNames = _.sortBy(actualNames);
        expect(
          actualNames,
          "sorted by last editor name alphabetically reversed",
        ).to.deep.equal(sortedNames.reverse());
      });

      toggleSortingFor(/Last edited at/i);
      cy.wait("@getCollectionItems");

      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        expect(actualNames, "sorted newest last").to.deep.equal(sortedNames);
      });

      toggleSortingFor(/Last edited at/i);
      cy.wait("@getCollectionItems");

      getAllCollectionItemNames().then(({ actualNames, sortedNames }) => {
        const newestFirst = _.chain(sortedNames)
          .reverse()
          .sortBy(name => name.toLowerCase().includes("collection"))
          .sortBy(name => name.toLowerCase().includes("personal"))
          .value();
        expect(actualNames, "sorted newest first").to.deep.equal(newestFirst);
      });
    });

    test("should reset pagination if sorting applied on not first page", async ({ page }) => {
      _.times(15, i => cy.createDashboard(`dashboard ${i}`));
      _.times(15, i =>
        cy.createQuestion({
          name: `generated question ${i}`,
          query: TEST_QUESTION_QUERY,
        }),
      );

      visitRootCollection();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText(`1 - ${PAGE_SIZE}`);

      await page.locator('[aria-label="Next page"]').click();
      cy.wait("@getCollectionItems");

      toggleSortingFor(/Last edited at/i);
      cy.wait("@getCollectionItems");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText(`1 - ${PAGE_SIZE}`);
    });
  });
});

async function toggleSortingFor(columnName, page) {
  const testId = "items-table-head";
  await page.locator(`[data-testid="${testId}"]`).locator(`:text("${columnName}")`).click();
}

async function getAllCollectionItemNames(page) {
  const testId = "collection-entry-name";
  const nodes = await page.locator(`[data-testid="${testId}"]`).all();
  const actualNames = nodes.map(node => node.textContent());
  const sortedNames = _.sortBy(actualNames);
  return { actualNames, sortedNames };
}

async function visitRootCollection(page) {
  await page.goto("/collection/root");
  await page.waitForResponse("/api/collection/root/items?*");
  await page.waitForResponse("/api/collection/root/items?*");
}
