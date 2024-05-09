import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const filter = {
  id: "774521fb-e03f-3df1-f2ae-e952c97035e3",
  name: "FILTER",
  "display-name": "Filter",
  type: "dimension",
  dimension: ["field-id", PRODUCTS.CATEGORY],
  "widget-type": "category",
  default: null,
};

const nativeQuery = {
  name: "14145",
  native: {
    query: "SELECT COUNT(*) FROM products WHERE {{filter}}",
    "template-tags": {
      filter,
    },
  },
};

describe.skip("issue 14145", (() => {
  test.beforeEach(async () => {
    await intercept("POST", "/api/dataset").as("dataset");

    restore();
    await signInAsAdmin();

    await addH2SampleDatabase({
      name: "Sample2",
      auto_run_queries: true,
      is_full_sync: true,
    });

    await createNativeQuestion(nativeQuery, { visitQuestion: true });
  });

  test("`field-id` should update when database source is changed (metabase#14145)", async ({ page }) => {
    // Change the source from "Sample Database" to the other database
    await page.locator(/Open Editor/i).click();

    await page.locator(".GuiBuilder-data").as("source").contains("Sample Database").click();
    await page.locator(/Sample2/).click();

    // First assert on the UI
    await page.locator(".icon-variable").click();
    await page.locator(/Field to map to/)
      .sibling("a")
      .contains("Category");

    // Rerun the query and assert on the dimension (field-id) that didn't change
    await page.locator(".NativeQueryEditor .Icon-play").click();

    await page.waitForResponse("@dataset").then(xhr => {
      const { dimension } =
        xhr.response.body.json_query.native["template-tags"].FILTER;

      expect(dimension).not.to.contain(PRODUCTS.CATEGORY);
    });
  });
}));
