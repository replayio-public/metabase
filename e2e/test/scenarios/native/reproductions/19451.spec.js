import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const question = {
  name: "19451",
  native: {
    query: "select count(*) from products where {{filter}}",
    "template-tags": {
      filter: {
        id: "1b33304a-18ea-cc77-083a-b5225954f200",
        name: "filter",
        "display-name": "Filter",
        type: "dimension",
        dimension: ["field", PRODUCTS.ID, null],
        "widget-type": "id",
        default: null,
      },
    },
  },
  display: "scalar",
};


test.describe("issue 19451", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await createNativeQuestion(page, question, { visitQuestion: true });
  });

  test("question field filter shows all tables from a selected database (metabase#19451)", async ({ page }) => {
    await page.locator('text="Open Editor"').click();
    await page.locator('icon="variable"').click();
    await page.locator('text="Products"').click();
    await page.locator('icon="chevronleft"').click();

    await page.locator('text="Products"');
    await page.locator('text="Orders"');
    await page.locator('text="People"');
    await page.locator('text="Reviews"');
  });
});
