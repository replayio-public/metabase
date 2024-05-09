import { restore } from "e2e/support/helpers";


test.describe("scenarios > auth > search", () => {
  beforeEach(restore);

  test.describe("universal search", () => {
    test("should work for admin (metabase#20018)", async ({ page }) => {
      await signInAsAdmin();

      await page.goto("/");
      await page.locator('input[placeholder="Search…"]')
        .as("searchBox")
        .fill("product")
        .blur();

      await page.locator('[data-testid="search-results-list"]').within(() => {
        getProductsSearchResults();
      });

      await page.locator('@searchBox').press('Enter');

      await page.locator('[data-testid="search-result-item"]').within(() => {
        getProductsSearchResults();
      });
    });

    test("should work for user with permissions (metabase#12332)", async ({ page }) => {
      await signInAsNormalUser();
      await page.goto("/");
      await page.locator('input[placeholder="Search…"]').fill("product");
      await page.locator('input[placeholder="Search…"]').press('Enter');
      await page.locator(':text("Products")');
    });

    test("should work for user without data permissions (metabase#16855)", async ({ page }) => {
      await signIn("nodata");
      await page.goto("/");
      await page.locator('input[placeholder="Search…"]').fill("product");
      await page.locator('input[placeholder="Search…"]').press('Enter');
      await page.locator(':text("Didn\'t find anything")');
    });

    test("allows to select a search result using keyboard", async ({ page }) => {
      await intercept("GET", "/api/search*").as("search");

      await signInAsNormalUser();
      await page.goto("/");
      await page.locator('input[placeholder="Search…"]').fill("ord");
      await page.waitForResponse("@search");
      await expect(page.locator('[data-testid="search-result-item-name"]').first()).toHaveText("Orders");

      await realPress("ArrowDown");
      await realPress("Enter");

      expect(await page.url()).toContain("/question/1-orders");
    });
  });
});


async function getProductsSearchResults() {
  await page.locator(':text("Products")');
  await page.locator(':text("Includes a catalog of all the products ever sold by the famed Sample Company.")');
}
