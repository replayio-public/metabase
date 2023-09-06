import { restore, popover, getFullName } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const { normal } = USERS;

const { first_name, last_name, email, password } = normal;

test.describe("user > settings", () => {
  const fullName = getFullName(normal);

  test.beforeEach(async () => {
    restore();
    cy.signInAsNormalUser();
  });

  test('should be able to remove first name and last name (metabase#22754)', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page.locator('input[label="First name"]')).toHaveValue(first_name);
    await expect(page.locator('input[label="Last name"]')).toHaveValue(last_name);
    await page.locator('input[label="First name"]').clear();
    await page.locator('input[label="Last name"]').clear();
    await page.locator('button:text("Update")').click();

    await page.reload();

    await expect(page.locator('input[label="First name"]')).toHaveValue('');
    await expect(page.locator('input[label="Last name"]')).toHaveValue('');
  });

  // ... other tests

});

/**
 * Stub the current user authentication method
 *
 * @param {Object} authenticationMethod
 */
async function stubCurrentUser(authenticationMethod) {
  const user = await page.locator('text=/api/user/current').jsonValue();
  await page.route('GET', '/api/user/current', (route) => {
    route.fulfill(Object.assign({}, user, authenticationMethod));
  }).as('getUser');
}
