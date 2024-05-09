import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const categoryFilter = {
  id: "00315d5e-4a41-99da-1a41-e5254dacff9d",
  name: "category",
  "display-name": "Category",
  type: "dimension",
  default: "Doohickey",
  dimension: ["field", PRODUCTS.CATEGORY, null],
  "widget-type": "category",
};

const productIdFilter = {
  id: "4775bccc-e82a-4069-fc6b-2acc90aadb8b",
  name: "prodid",
  "display-name": "ProdId",
  type: "number",
  default: null,
};

const nativeQuery = {
  name: "13961",
  native: {
    query:
      "SELECT * FROM PRODUCTS WHERE 1=1 AND {{category}} [[AND ID={{prodid}}]]",
    "template-tags": {
      category: categoryFilter,
      prodid: productIdFilter,
    },
  },
};

describe.skip("issue 13961", (() => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(nativeQuery, { visitQuestion: true });
  });

  test('should clear default filter value in native questions (metabase#13961)', async ({ page }) => {
    await page.locator('text=Small Marble Shoes'); // Product ID 2, Doohickey

    await expect(page.url()).toContain("?category=Doohickey");

    // Remove default filter (category)
    await page.locator('fieldset .Icon-close').click();

    await page.locator('icon[name="play"]').first().isVisible().as('rerunQuestion').click();
    await page.waitForResponse('@cardQuery');

    await expect(page.url()).not.toContain("?category=Doohickey");

    // Add value `1` to the ID filter
    await page.locator(`input[placeholder="${productIdFilter["display-name"]}"]`).fill('1');

    await page.locator('@rerunQuestion').click();
    await page.waitForResponse('@cardQuery');

    await expect(page.url()).toContain(`?${productIdFilter.name}=1`);
    await page.locator('text=Rustic Paper Wallet'); // Product ID 1, Gizmo
  });
}));
