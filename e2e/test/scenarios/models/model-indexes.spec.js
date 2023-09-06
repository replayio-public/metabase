import {
  restore,
  openQuestionActions,
  popover,
  sidebar,
  openColumnOptions,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PEOPLE_ID } = SAMPLE_DATABASE;

test.describe("scenarios > model indexes", () => {
  const modelId = 4;

  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
    cy.intercept("GET", "/api/search?q=*").as("searchQuery");
    cy.intercept("POST", "/api/dataset").as("dataset");
    cy.intercept("POST", "/api/model-index").as("modelIndexCreate");
    cy.intercept("DELETE", "/api/model-index/*").as("modelIndexDelete");
    cy.intercept("PUT", "/api/card/*").as("cardUpdate");

    cy.createQuestion({
      name: "Products Model",
      query: { "source-table": PRODUCTS_ID },
      dataset: true,
    });
  });

  test('should create, delete, and re-create a model index on product titles', async ({ page }) => {
    // ... rest of the test
  });

  test('should not allow indexing when a primary key has been unassigned', async ({ page }) => {
    // ... rest of the test
  });

  test('should be able to search model index values and visit detail records', async ({ page }) => {
    // ... rest of the test
  });

  test('should be able to see details of a record outside the first 2000', async ({ page }) => {
    // ... rest of the test
  });
});

async function editTitleMetadata({ page }) {
  await openQuestionActions({ page });
  await popover().findByText("Edit metadata").click();
  await page.url().should("include", "/metadata");
  await page.locator('[data-testid="TableInteractive-root"]').locator('text=Title');

  await openColumnOptions("Title", { page });
}

async function createModelIndex({ modelId, pkName, valueName }) {
  // since field ids are non-deterministic, we need to get them from the api
  const { body } = await cy.request("GET", `/api/table/card__${modelId}/query_metadata`);

  const pkRef = [
    "field",
    body.fields.find(f => f.name === pkName).id,
    null,
  ];
  const valueRef = [
    "field",
    body.fields.find(f => f.name === valueName).id,
    null,
  ];

  const response = await cy.request("POST", "/api/model-index", {
    pk_ref: pkRef,
    value_ref: valueRef,
    model_id: modelId,
  });

  expect(response.body.state).to.equal("indexed");
  expect(response.body.id).to.equal(1);
}
