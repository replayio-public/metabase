import {
  restore,
  modal,
  popover,
  navigationSidebar,
} from "e2e/support/helpers";

const modelName = "Orders Model";


test.describe("issue 19737", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.request("PUT", "/api/card/1", { name: modelName, dataset: true });
  });

  test('should show moved model in the data picker without refreshing (metabase#19737)', async ({ page }) => {
    await page.goto('/collection/root');

    moveModel(modelName, "My personal collection");

    await page.locator('text="Moved model"');

    await page.locator('text="New"').click();
    await page.locator('text="Question"').isVisible().click();

    popover().within(() => {
      cy.findByText("Models").click();
      cy.findByText("Your personal collection").click();
      cy.findByText(modelName);
    });
  });

  test('should not show duplicate models in the data picker after it\'s moved from a custom collection without refreshing (metabase#19737)', async ({ page }) => {
    await page.goto('/collection/root');

    moveModel(modelName, "First collection");

    await page.locator('text="Moved model"');
    await page.locator('icon="close:visible"').click();

    await page.locator('text="New"').click();
    await page.locator('text="Question"').isVisible().click();

    popover().within(() => {
      cy.findByText("Models").click();
      cy.findByText("First collection").click();
      cy.findByText(modelName);
    });

    await page.goBack();

    navigationSidebar().findByText("First collection").click();

    moveModel(modelName, "My personal collection");

    await page.locator('text="Moved model"');

    await page.locator('text="New"').click();
    await page.locator('text="Question"').isVisible().click();

    popover().within(() => {
      cy.findByText("Models").click();
      cy.findByText("First collection").click();
      cy.findByText("Nothing here");
    });
  });
});



async function moveModel(modelName, collectionName) {
  openEllipsisMenuFor(modelName);
  popover().contains("Move").click();

  modal().within(() => {
    cy.findByText(collectionName).click();
    cy.findByText("Move").click();
  });
}



async function openEllipsisMenuFor(item) {
  cy.findByText(item).closest("tr").find(".Icon-ellipsis").click();
}

