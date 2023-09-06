import { restore, visitQuestion, visitDashboard } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

test.describe("scenarios > collection items metadata", () => {
  test.beforeEach(async () => {
    restore();
  });

  test.describe("last edit date", () => {
    test.beforeEach(async () => {
      cy.signInAsAdmin();
    });

    test('should display last edit moment for dashboards', async ({ page }) => {
      visitDashboard(1);
      changeDashboard();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited a few seconds ago")')).toBeVisible();
    });

    test('should display last edit moment for questions', async ({ page }) => {
      visitQuestion(1);
      changeQuestion();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited a few seconds ago")')).toBeVisible();
    });
  });

  test.describe("last editor", () => {
    test('should display if user is the last editor', async ({ page }) => {
      cy.signInAsAdmin();
      visitDashboard(1);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited .* by you")')).toBeVisible();
      visitQuestion(1);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited .* by you")')).toBeVisible();
    });

    test('should display last editor\'s name', async ({ page }) => {
      const { first_name, last_name } = USERS.admin;
      // Example: John Doe —> John D.
      const expectedName = `${first_name} ${last_name.charAt(0)}.`;

      cy.signIn("normal");
      visitDashboard(1);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited .* by ${expectedName}")')).toBeVisible();
      visitQuestion(1);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("Edited .* by ${expectedName}")')).toBeVisible();
    });

    test('should change last editor when another user changes item', async ({ page }) => {
      const { first_name, last_name } = USERS.normal;
      const fullName = `${first_name} ${last_name}`;

      cy.signIn("normal");
      cy.visit("/collection/root");
      // Ensure nothing is edited by current user,
      // Otherwise, the test is irrelevant
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator(':text("${fullName}")')).not.toBeVisible();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Orders")').click();
      changeQuestion();

      cy.visit("/collection/root");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Orders in a dashboard")').click();
      changeDashboard();

      cy.visit("/collection/root");
      getTableRowFor("Orders!").findByText(fullName);
      getTableRowFor("Dash").findByText(fullName);
    });
  });
});

async function changeDashboard() {
  await page.route('PUT', '/api/dashboard/**').as('updateDashboard');
  await page.locator('input[value="Orders in a dashboard"]').fill('Dash');
  await page.locator('input[value="Orders in a dashboard"]').blur();
  await page.waitForResponse('@updateDashboard');
}

async function changeQuestion() {
  await page.route('PUT', '/api/card/**').as('updateQuestion');
  await page.locator('input[value="Orders"]').fill('Orders!');
  await page.locator('input[value="Orders"]').blur();
  await page.waitForResponse('@updateQuestion');
}

function getTableRowFor(name) {
  return page.locator(`:text("${name}")`).closest('tr');
}
