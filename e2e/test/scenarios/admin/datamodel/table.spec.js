import { restore, filter, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > admin > databases > table", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('should see 8 tables in sample database', async ({ page }) => {
    await page.goto(`/admin/datamodel/database/${SAMPLE_DB_ID}`);
    await expect(page.locator('.AdminList-item')).toHaveCount(8);
  });

  test('should be able to see details of each table', async ({ page }) => {
    await page.goto(`/admin/datamodel/database/${SAMPLE_DB_ID}`);
    await page.locator('text=Select any table to see its schema and add or edit metadata.').isVisible();

    // Orders
    await page.locator('text=Orders').click();
    await page.locator('text=Select any table to see its schema and add or edit metadata.').isHidden();
    await expect(page.locator("input[value='Confirmed Sample Company orders for a product, from a user.']")).toBeVisible();
  });

  test('should show 404 if database does not exist (metabase#14652)', async ({ page }) => {
    await page.goto("/admin/datamodel/database/54321");
    await expect(page.locator(".AdminList-item")).toHaveCount(0);
    await page.locator('text=Not found.').isVisible();
    await page.locator('text=Select a database').isVisible();
  });

  test.describe("in orders table", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${ORDERS_ID}`,
      );
    });

    test('should see multiple fields', async ({ page }) => {
      await expect(page.locator("input[value='User ID']")).toBeVisible();
      await expect(page.locator('text=Foreign Key')).toHaveCount(2);

      await expect(page.locator("input[value='Tax']")).toBeVisible();
      await expect(page.locator('text=No semantic type')).toHaveCount(2);

      await expect(page.locator("input[value='Discount']")).toBeVisible();
      await page.locator('text=Discount').isVisible();
    });

    test('should see the id field', async ({ page }) => {
      await expect(page.locator("input[value='ID']")).toBeVisible();
      await expect(page.locator('text=Entity Key')).toHaveCount(2);
    });

    test('should see the created_at timestamp field', async ({ page }) => {
      await expect(page.locator("input[value='Created At']")).toBeVisible();
      await page.locator('text=Creation timestamp').isVisible();
    });
  });

  test.describe.skip("turning table visibility off shouldn't prevent editing related question (metabase#15947)", () => {
    test('simple question (metabase#15947-1)', async () => {
      turnTableVisibilityOff(ORDERS_ID);
      visitQuestion(1);
      filter();
    });

    test('question with joins (metabase#15947-2)', async () => {
      cy.createQuestion({
        name: "15947",
        query: {
          "source-table": ORDERS_ID,
          joins: [
            {
              fields: "all",
              "source-table": PRODUCTS_ID,
              condition: [
                "=",
                ["field", ORDERS.PRODUCT_ID, null],
                ["field", PRODUCTS.ID, { "join-alias": "Products" }],
              ],
              alias: "Products",
            },
          ],
          filter: [
            "and",
            ["=", ["field", ORDERS.QUANTITY, null], 1],
            [">", ["field", PRODUCTS.RATING, { "join-alias": "Products" }], 3],
          ],
          aggregation: [
            ["sum", ["field", ORDERS.TOTAL, null]],
            ["sum", ["field", PRODUCTS.RATING, { "join-alias": "Products" }]],
          ],
          breakout: [
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }],
            ["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }],
          ],
        },
      }).then(({ body: { id: QUESTION_ID } }) => {
        turnTableVisibilityOff(PRODUCTS_ID);
        cy.visit(`/question/${QUESTION_ID}/notebook`);
        cy.findByText("Products");
        cy.findByText("Quantity is equal to 1");
        cy.findByText("Rating is greater than 3");
      });
    });
  });
});

async function turnTableVisibilityOff(table_id) {
  await cy.request("PUT", "/api/table", {
    ids: [table_id],
    visibility_type: "hidden",
  });
}
