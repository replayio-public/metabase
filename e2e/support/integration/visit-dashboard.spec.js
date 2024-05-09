import { restore, visitDashboard } from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

import { setup } from "./visit-dashboard";


test.describe(`visitDashboard e2e helper`, () => {
  Object.keys(Cypress._.omit(USERS, "sandboxed")).forEach(user => {
    test.describe(`${user.toUpperCase()}`, () => {
      test.beforeEach(async ({ page }) => {
        restore();
        await signInAsAdmin();

        setup();

        if (user !== "admin") {
          await signIn(user);
        }
      });

      test("should work on an empty dashboard", async ({ page }) => {
        const id = await page.locator("@emptyDashboard").textContent();
        visitDashboard(id);
      });

      test("should work on a dashboard with markdown card", async ({ page }) => {
        const id = await page.locator("@markdownOnly").textContent();
        visitDashboard(id);
      });

      test("should work on a dashboard with a model", async ({ page }) => {
        const id = await page.locator("@modelDashboard").textContent();
        visitDashboard(id);
      });

      test("should work on a dashboard with a GUI question", async ({ page }) => {
        const id = await page.locator("@guiDashboard").textContent();
        visitDashboard(id);
      });

      test("should work on a dashboard with a native question", async ({ page }) => {
        const id = await page.locator("@nativeDashboard").textContent();
        visitDashboard(id);
      });

      test("should work on a dashboard with multiple cards (including markdown, models, pivot tables, GUI and native)", async ({ page }) => {
        const id = await page.locator("@multiDashboard").textContent();
        visitDashboard(id);
      });
    });
  });
});

