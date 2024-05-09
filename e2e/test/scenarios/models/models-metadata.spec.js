import {
  restore,
  rightSidebar,
  visualize,
  visitDashboard,
  popover,
  openQuestionActions,
  questionInfoButton,
  addOrUpdateDashboardCard,
  openColumnOptions,
  renameColumn,
  setColumnType,
  mapColumnTo,
  setModelMetadata,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { startQuestionFromModel } from "./helpers/e2e-models-helpers";

const { PEOPLE, PRODUCTS, PRODUCTS_ID, REVIEWS } = SAMPLE_DATABASE;

test.describe("scenarios > models metadata", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("POST", "/api/card/*/query").as("cardQuery");
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test.describe("GUI model", () => {
    test.beforeEach(async () => {
      // Convert saved question "Orders" into a model
      cy.request("PUT", "/api/card/1", {
        name: "GUI Model",
        dataset: true,
      });

      cy.visit("/model/1");
    });

    test('should edit GUI model metadata', async () => {
      // ... rest of the test cases
    });

    // ... rest of the test.describe blocks
  });

  // ... rest of the test.describe blocks
});

async function drillFK({ id }) {
  await page.locator('.Table-FK').locator(`text=${id}`).first().click();
  await page.locator('.Popover').locator('text=View details').click();
}

async function drillDashboardFK({ id }) {
  await page.locator('.Table-FK').locator(`text=${id}`).first().click();
}
