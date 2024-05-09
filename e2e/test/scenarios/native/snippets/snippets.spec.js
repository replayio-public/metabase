import { restore, modal, openNativeEditor } from "e2e/support/helpers";

// HACK which lets us type (even very long words) without losing focus
// this is needed for fields where autocomplete suggestions are enabled
async function _clearAndIterativelyTypeUsingLabel(page, label, string) {
  await page.locator(`[aria-label="${label}"]`).click().clear();

  for (const char of string) {
    await page.locator(`[aria-label="${label}"]`).type(char);
  }
}

test.describe("scenarios > question > snippets", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test('should let you create and use a snippet', async ({ page }) => {
    openNativeEditor().type(
      // Type a query and highlight some of the text
      "select 'stuff'" + "{shift}{leftarrow}".repeat("'stuff'".length),
    );

    // Add a snippet of that text
    await page.locator('icon:snippet').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Create a snippet")').click();

    modal().within(() => {
      page.locator('[aria-label="Give your snippet a name"]').type("stuff-snippet");
      page.locator(':text("Save")').click();
    });

    // SQL editor should get updated automatically
    await page.locator('@editor').toContainText("select {{snippet: stuff-snippet}}");

    // Run the query and check the value
    await page.locator('.NativeQueryEditor .Icon-play').click();
    await page.locator('.ScalarValue').toContainText("stuff");
  });

  test('should let you edit snippet', async ({ page }) => {
    // Re-create the above snippet via API without the need to rely on the previous test
    cy.request("POST", "/api/native-query-snippet", {
      name: "stuff-snippet",
      content: "stuff",
    });

    // Populate the native editor first
    // 1. select
    openNativeEditor().type("select ");
    // 2. snippet
    await page.locator('icon:snippet').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("stuff-snippet")').click();

    // Open the snippet edit modal
    await page.locator('icon:chevrondown').click({ force: true });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Edit")').click();

    // Update the name and content
    modal().within(() => {
      page.locator(':text("Editing stuff-snippet")');

      _clearAndIterativelyTypeUsingLabel(
        page,
        "Enter some SQL here so you can reuse it later",
        "1+1",
      );
      _clearAndIterativelyTypeUsingLabel(page, "Give your snippet a name", "Math");

      page.locator(':text("Save")').click();
    });

    // SQL editor should get updated automatically
    await page.locator('@editor').toContainText("select {{snippet: Math}}");

    // Run the query and check the new value
    await page.locator('.NativeQueryEditor .Icon-play').click();
    await page.locator('.ScalarValue').toContainText("2");
  });

  test('should update the snippet and apply it to the current query (metabase#15387)', async ({ page }) => {
    // Create snippet 1
    cy.request("POST", "/api/native-query-snippet", {
      content: "ORDERS",
      name: "Table: Orders",
      collection_id: null,
    }).then(({ body: { id: SNIPPET_ID } }) => {
      // Create snippet 2
      cy.request("POST", "/api/native-query-snippet", {
        content: "REVIEWS",
        name: "Table: Reviews",
        collection_id: null,
      });

      // Create native question using snippet 1
      cy.createNativeQuestion(
        {
          name: "15387",
          native: {
            "template-tags": {
              "snippet: Table: Orders": {
                id: "14a923c5-83a2-b359-64f7-5e287c943caf",
                name: "snippet: Table: Orders",
                "display-name": "Snippet: table: orders",
                type: "snippet",
                "snippet-name": "Table: Orders",
                "snippet-id": SNIPPET_ID,
              },
            },
            query: "select * from {{snippet: Table: Orders}} limit 1",
          },
        },
        { visitQuestion: true },
      );
    });

    await page.locator('.Visualization').as('results').toContainText("37.65");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text(/Open Editor/i)').click();
    // We need these mid-point checks to make sure Cypress typed the sequence/query correctly
    // Check 1
    await page.locator('.ace_content')
      .as('editor')
      .toContainText(/^select \* from {{snippet: Table: Orders}} limit 1$/);
    // Replace "Orders" with "Reviews"
    await page.locator('@editor')
      .click()
      .type(
        "{end}" +
          "{leftarrow}".repeat("}} limit 1".length) + // move left to "reach" the "Orders"
          "{backspace}".repeat("Orders".length) + // Delete orders character by character
          "Reviews",
      );
    // Check 2
    await page.locator('@editor').toContainText(
      /^select \* from {{snippet: Table: Reviews}} limit 1$/,
    );
    // Rerun the query
    await page.locator('.NativeQueryEditor .Icon-play').click();
    await page.locator('@results').toContainText(/christ/i);
  });
});
