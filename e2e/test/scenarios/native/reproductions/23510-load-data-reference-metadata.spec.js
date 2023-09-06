import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
const { PRODUCTS } = SAMPLE_DATABASE;


test.describe("issue 23510", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("loads metadata when it is not cached (metabase#23510)", async ({ page }) => {
    const question = {
      database: 1,
      name: `Q23510`,
      native: {
        query:
          "select count(*) from orders left join products on products.id=orders.product_id where {{category}}",
        "template-tags": {
          ID: {
            id: "6b8b10ef-0104-1047-1e1b-2492d5954322",
            name: "Category",
            display_name: "Category",
            type: "dimension",
            dimension: ["field", PRODUCTS.CATEGORY, null],
            "widget-type": "category",
            default: null,
          },
        },
      },
      display: "scalar",
    };

    await createNativeQuestion(page, question, { visitQuestion: true });

    await page.click('text="Open Editor"');
    await page.click('text="Reference"');

    await page.locator('[data-testid="sidebar-content"]').within(async () => {
      await page.locator('text="ORDERS"');
      await page.locator('text="PRODUCTS"');
      await page.locator('text="REVIEWS"');
      await page.locator('text="PEOPLE"');
      await page.locator('text="Sample Database"');
    });
  });
});

