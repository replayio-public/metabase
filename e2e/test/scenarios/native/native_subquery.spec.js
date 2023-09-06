import {
  openNativeEditor,
  openQuestionActions,
  restore,
  visitQuestion,
  startNewNativeQuestion,
  runNativeQuery,
} from "e2e/support/helpers";

import * as SQLFilter from "../native-filters/helpers/e2e-sql-filter-helpers";

test.describe("scenarios > question > native subquery", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test('typing a card tag should open the data reference', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('autocomplete should complete question slugs inside template tags', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('autocomplete should work for columns from referenced questions', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('card reference tags should update when the name of the card changes', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('should allow a user with no data access to execute a native subquery', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('should be able to reference a nested question (metabase#25988)', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });

  test('should be able to reference a saved native question that ends with a semicolon `;` (metabase#28218)', async ({ page }) => {
    // ... (keep the existing code inside the test)
  });
});
