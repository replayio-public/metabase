import { restore, startNewQuestion } from "e2e/support/helpers";

import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, PRODUCTS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > admin > datamodel > hidden tables (metabase#9759)", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    // Toggle the table to be hidden as admin user
    hideTable(ORDERS_ID);
  });

  test('hidden table should not show up in various places in UI', async ({ page }) => {
    // Visit the main page, we shouldn't be able to see the table
    await page.goto(`/browse/${PRODUCTS_ID}`);
    await expect(page.locator(':text("Products")')).toBeVisible();
    await expect(page.locator(':text("Orders")')).not.toBeVisible();

    // It shouldn't show up for a normal user either
    cy.signInAsNormalUser();
    await page.goto(`/browse/${PRODUCTS_ID}`);
    await expect(page.locator(':text("Products")')).toBeVisible();
    await expect(page.locator(':text("Orders")')).not.toBeVisible();

    // It shouldn't show in a new question data picker
    startNewQuestion();
    await page.locator(':text("Sample Database")').click();
    await expect(page.locator(':text("Products")')).toBeVisible();
    await expect(page.locator(':text("Orders")')).not.toBeVisible();
  });
});

async function hideTable(table) {
  const TABLE_URL = `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${table}`;

  await page.goto(TABLE_URL);
  await page.locator(':text("Hidden")').click();
  await page.waitForResponse(response => response.url().includes(`/api/table/${table}`) && response.request().method() === 'PUT');
}
