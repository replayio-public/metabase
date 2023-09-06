import {
  getCollectionIdFromSlug,
  modal,
  popover,
  restore,
  visitCollection,
} from "e2e/support/helpers";

const modelName = "A name";


test.describe("scenarios > models > create", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.route("POST", "/api/dataset");
  });

  test("creates a native query model via the New button", async ({ page }) => {
    await page.goto("/");

    await navigateToNewModelPage(page);

    // Cancel creation with confirmation modal
    await page.locator('text="Cancel"').click();
    await page.locator('text="Discard"').click();

    // Now we will create a model
    await navigateToNewModelPage(page);

    // Clicking on metadata should not work until we run a query
    await expect(page.locator('[data-testid="editor-tabs-metadata"]')).toBeDisabled();

    await page.locator('.ace_editor').type("select * from ORDERS");

    await page.locator('text="Save"').click();

    await page.locator('[placeholder="What is the name of your model?"]').fill(modelName);

    await page.locator('text="Save"').click();

    // After saving, we land on view mode for the model
    await page.locator('text="Summarize"');

    await checkIfPinned(page);
  });

  test("suggest the currently viewed collection when saving a new native query", async ({ page }) => {
    await getCollectionIdFromSlug("third_collection", async THIRD_COLLECTION_ID => {
      await visitCollection(page, THIRD_COLLECTION_ID);
    });

    await navigateToNewModelPage(page);
    await page.locator('.ace_editor').type("select * from ORDERS");

    await page.locator('[data-testid="dataset-edit-bar"]').locator('button:has-text("Save")').click();

    await modal(page).locator('[data-testid="select-button"]').expect.toHaveText("Third collection");
  });

  test("suggest the currently viewed collection when saving a new structured query", async ({ page }) => {
    await getCollectionIdFromSlug("third_collection", async THIRD_COLLECTION_ID => {
      await visitCollection(page, THIRD_COLLECTION_ID);
    });

    await navigateToNewModelPage(page, "structured");

    await popover(page).locator('text="Sample Database"').click();
    await popover(page).locator('text="Orders"').click();

    await page.locator('[data-testid="dataset-edit-bar"]').locator('button:has-text("Save")').click();

    await modal(page).locator('[data-testid="select-button"]').expect.toHaveText("Third collection");
  });
});



async function navigateToNewModelPage(page, queryType = "native") {
  await page.locator('text="New"').click();
  await page.locator('text="Model"').click();
  if (queryType === "structured") {
    await page.locator('text="Use the notebook editor"').click();
  } else {
    await page.locator('text="Use a native query"').click();
  }
}



async function checkIfPinned(page) {
  await visitCollection(page, "root");

  await page.locator(`text="${modelName}"`).locator('~ a .Icon-ellipsis').click({ force: true });

  await page.locator('text="Unpin"').isVisible();
}

