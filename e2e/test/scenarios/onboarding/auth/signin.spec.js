import { browse, restore } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const sizes = [
  [1280, 800],
  [640, 360],
];
const { admin } = USERS;


test.describe("scenarios > auth > signin", () => {
  test.beforeEach(async () => {
    restore();
    cy.signOut();
    cy.intercept("POST", "/api/dataset").as("dataset");
  });

  test("should redirect to /auth/login", async ({ page }) => {
    await page.goto("/");
    await expect(page.url()).toContain("auth/login");
  });

  test("should redirect to / when logged in", async ({ page }) => {
    await cy.signInAsAdmin();
    await page.goto("/auth/login");
    await expect(page.url()).not.toContain("auth/login");
    await expect(page.locator('.Icon[gear]')).toBeVisible();
  });

  test("should display an error for incorrect passwords", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[aria-label="Email address"]').fill(admin.email);
    await page.locator('input[aria-label="Password"]').fill("INVALID" + admin.password);
    await page.locator(':text("Sign in")').click();
    await expect(page.locator(':text("did not match stored password")')).toBeVisible();
  });

  test("should display same error for unknown users (to avoid leaking the existence of accounts)", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[aria-label="Email address"]').fill("INVALID" + admin.email);
    await page.locator('input[aria-label="Password"]').fill(admin.password);
    await page.locator(':text("Sign in")').click();
    await expect(page.locator(':text("did not match stored password")')).toBeVisible();
  });

  test("should greet users after successful login", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator('input[aria-label="Email address"]').fill(admin.email);
    await page.locator('input[aria-label="Password"]').fill(admin.password);
    await page.locator(':text("Sign in")').click();
    await expect(page.locator(':text(/^[a-z ]+, Bob/i)')).toBeVisible();
  });

  test("should allow login regardless of login email case", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator('input[aria-label="Email address"]').fill(admin.email.toUpperCase());
    await page.locator('input[aria-label="Password"]').fill(admin.password);
    await page.locator(':text("Sign in")').click();
    await expect(page.locator(':text(/^[a-z ]+, Bob/i)')).toBeVisible();
  });

  test("should allow toggling of Remember Me", async ({ page }) => {
    await page.goto("/auth/login");

    // default initial state
    await expect(page.locator('input[role="checkbox"]')).toBeChecked();

    await page.locator('label[aria-label="Remember me"]').click();
    await expect(page.locator('input[role="checkbox"]')).not.toBeChecked();
  });

  test("should redirect to a unsaved question after login", async ({ page }) => {
    await cy.signInAsAdmin();
    await page.goto("/");
    // Browse data moved to an icon
    browse().click();
    await page.locator(':text("Sample Database")').click();
    await page.locator(':text("Orders")').click();
    await page.waitForResponse("@dataset");
    await expect(page.locator(':text("37.65")')).toBeVisible();

    // signout and reload page with question hash in url
    cy.signOut();
    await page.reload();

    await expect(page.locator(':text("Sign in to Metabase")')).toBeVisible();
    await page.locator('input[aria-label="Email address"]').fill(admin.email);
    await page.locator('input[aria-label="Password"]').fill(admin.password);
    await page.locator(':text("Sign in")').click();

    // order table should load after login
    await page.waitForResponse("@dataset");
    await expect(page.locator(':text("37.65")')).toBeVisible();
  });

  sizes.forEach(size => {
    test(`should redirect from /auth/forgot_password back to /auth/login (viewport: ${size}) (metabase#12658)`, async ({ page }) => {
      if (Array.isArray(size)) {
        page.setViewportSize({ width: size[0], height: size[1] });
      } else {
        page.setViewportSize({ width: size, height: 800 });
      }

      await page.goto("/");
      await expect(page.url()).toContain("auth/login");
      await page.locator(':text("I seem to have forgotten my password")').click();
      await expect(page.url()).toContain("auth/forgot_password");
      await page.locator(':text("Back to sign in")').click();
      await expect(page.url()).toContain("auth/login");
    });
  });
});

