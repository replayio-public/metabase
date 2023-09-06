import {
  restore,
  setupSMTP,
  visitQuestion,
  getFullName,
} from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const { normal, admin } = USERS;

test.describe("scenarios > alert > alert permissions", { tags: "@external" }, () => {
  // Intentional use of before (not beforeEach) hook because the setup is quite long.
  // Make sure that all tests are always able to run independently!
  test.before(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    setupSMTP();

    // Create alert as admin
    visitQuestion(1);
    createBasicAlert({ firstAlert: true });

    // Create alert as admin that user can see
    visitQuestion(2);
    createBasicAlert({ includeNormal: true });

    // Create alert as normal user
    await signInAsNormalUser(page);
    visitQuestion(3);
    createBasicAlert();
  });

  test.describe("as an admin", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsAdmin(page);
    });

    test("should let you see all created alerts", async ({ page }) => {
      const response = await page.request("/api/alert");
      expect(response.body).toHaveLength(3);
    });

    test("should let you edit an alert", async ({ page }) => {
      await page.route("PUT", "/api/alert/1", (route) => {
        route.fulfill({ status: 200, body: JSON.stringify(route.request().postData()) });
      });

      // Change alert
      visitQuestion(1);
      await page.locator(".Icon-bell").click();
      await page.locator(':text("Edit")').click();

      await page.locator(':text("Daily")').click();
      await page.locator(':text("Weekly")').click();

      await page.locator('button:text("Save changes")').click();

      // Check that changes stuck
      const response = await page.waitForResponse("/api/alert/1");
      const body = await response.json();
      expect(body.channels[0].schedule_type).toEqual("weekly");
    });
  });

  test.describe("as a non-admin / normal user", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsNormalUser(page);
    });

    test("should not let you see other people's alerts", async ({ page }) => {
      visitQuestion(1);
      await page.locator(".Icon-bell").click();

      await expect(page.locator(':text("Unsubscribe")')).not.toBeVisible();
      await expect(page.locator(':text("Set up an alert")')).toBeVisible();
    });

    test("should let you see other alerts where you are a recipient", async ({ page }) => {
      visitQuestion(2);
      await page.locator(".Icon-bell").click();

      await expect(page.locator(':text(`You\'re receiving ${getFullName(admin)}\'s alerts`)')).toBeVisible();
      await expect(page.locator(':text("Set up your own alert")')).toBeVisible();
    });

    test("should let you see your own alerts", async ({ page }) => {
      visitQuestion(3);
      await page.locator(".Icon-bell").click();

      await expect(page.locator(':text("You set up an alert")')).toBeVisible();
    });

    test("should let you unsubscribe from both your own and others' alerts", async ({ page }) => {
      // Unsubscribe from your own alert
      visitQuestion(3);
      await page.locator(".Icon-bell").click();
      await page.locator(':text("Unsubscribe")').click();

      await expect(page.locator(':text("Okay, you\'re unsubscribed")')).toBeVisible();

      // Unsubscribe from others' alerts
      visitQuestion(2);
      await page.locator(".Icon-bell").click();
      await page.locator(':text("Unsubscribe")').click();

      await expect(page.locator(':text("Okay, you\'re unsubscribed")')).toBeVisible();
    });
  });
});

async function createBasicAlert({ firstAlert, includeNormal } = {}, page) {
  await page.locator(".Icon-bell").click();

  if (firstAlert) {
    await page.locator(':text("Set up an alert")').click();
  }

  if (includeNormal) {
    await page.locator(':text("Email alerts to:")').locator(':nth-match(:text("Email alerts to:"), 1)').click();
    await page.locator(`:text("${getFullName(normal)}")`).click();
  }
  await page.locator(':text("Done")').click();
  await expect(page.locator(':text("Let\'s set up your alert")')).not.toBeVisible();
}
