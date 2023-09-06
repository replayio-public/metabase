import {
  restore,
  popover,
  typeAndBlurUsingLabel,
  isEE,
} from "e2e/support/helpers";
import {
  QA_MONGO_PORT,
  QA_MYSQL_PORT,
  QA_POSTGRES_PORT,
} from "e2e/support/cypress_data";

test.describe("admin > database > add", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.intercept("POST", "/api/database").as("createDatabase");

    cy.visit("/admin/databases/create");
    // should display a setup help card
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Need help connecting?");

    cy.findByLabelText("Database type").click();
  });

  test('should add a new database', async ({ page }) => {
    // ... (rest of the test cases)
  });

  // ... (rest of the test.describe blocks)
});

async function toggleFieldWithDisplayName(page, displayName) {
  await page.locator(`[aria-label="${displayName}"]`).click();
}

async function selectFieldOption(page, fieldName, option) {
  await page.locator(`[aria-label="${fieldName}"]`).click();
  await popover().locator(`:text("${option}")`).click({ force: true });
}

function chooseDatabase(database) {
  selectFieldOption("Database type", database);
}

async function mockUploadServiceAccountJSON(page, fileContents) {
  // create blob to act as selected file
  const input = await page.locator("input[type=file]");
  const blob = await Cypress.Blob.binaryStringToBlob(fileContents);
  const file = new File([blob], "service-account.json");
  const dataTransfer = new DataTransfer();

  dataTransfer.items.add(file);
  input[0].files = dataTransfer.files;
  await input.dispatchEvent("change", { force: true });
  await input.dispatchEvent("blur", { force: true });
}

async function mockSuccessfulDatabaseSave(page) {
  cy.intercept("POST", "/api/database", req => {
    req.reply({ statusCode: 200, body: { id: 42 }, delay: 100 });
  }).as("createDatabase");

  await page.locator('button:text("Save")').click();
  return cy.wait("@createDatabase");
}
