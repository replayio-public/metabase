import {
  restore,
  filterWidget,
  popover,
  visitDashboard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > dashboard > title drill", () => {
  test.describe("on a native question without connected dashboard parameters", () => {
    test.beforeEach(async () => {
      restore();
      cy.signInAsAdmin();

      const questionDetails = {
        name: "Q1",
        native: { query: 'SELECT 1 as "foo", 2 as "bar"' },
        display: "bar",
        visualization_settings: {
          "graph.dimensions": ["foo"],
          "graph.metrics": ["bar"],
        },
      };

      cy.createNativeQuestionAndDashboard({ questionDetails }).then(
        ({ body: { dashboard_id } }) => {
          visitDashboard(dashboard_id);
        },
      );
    });

    test.describe("as a user with access to underlying data", () => {
      test("should let you click through the title to the query builder (metabase#13042)", async ({ page }) => {
        // wait for question to load
        await page.locator('text=foo').first();

        // drill through title
        await page.locator('text=Q1').click();

        // check that we're in the QB now
        await page.locator('text=This question is written in SQL.');

        await page.locator('text=foo');
        await page.locator('text=bar');
      });
    });

    test.describe("as a user without access to the underlying data", () => {
      test.beforeEach(async () => {
        cy.signIn("nodata");
        cy.reload();
      });

      test("should let you click through the title to the query builder (metabase#13042)", async ({ page }) => {
        // wait for question to load
        await page.locator('text=foo').first();

        // drill through title
        await page.locator('text=Q1').click();

        // check that we're in the QB now
        await page.locator('text=This question is written in SQL.');

        await page.locator('text=foo');
        await page.locator('text=bar');
      });
    });
  });

  // ... other test.describe blocks ...
});

function checkFilterLabelAndValue(label, value) {
  filterWidget().find("legend").invoke("text").should("eq", label);
  filterWidget().contains(value);
}

async function checkScalarResult(result, page) {
  await expect(page.locator(".ScalarValue").textContent()).toBe(result);
}
