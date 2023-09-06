import {
  restore,
  navigationSidebar,
  popover,
  getFullName,
} from "e2e/support/helpers";
import { USERS, SAMPLE_DB_ID } from "e2e/support/cypress_data";

import { SAVED_QUESTIONS_VIRTUAL_DB_ID } from "metabase-lib/metadata/utils/saved-questions";

const { admin, normal } = USERS;


test.describe("URLs", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test.describe("browse databases", () => {
    test(`should slugify database name when opening it from /browse"`, async ({ page }) => {
      await page.goto("/browse");
      await page.locator('text=Sample Database').click();
      await page.locator('text=Sample Database');
      expect(await page.url()).toContain(`/browse/${SAMPLE_DB_ID}-sample-database`);
    });

    [
      `/browse/${SAVED_QUESTIONS_VIRTUAL_DB_ID}`,
      `/browse/${SAVED_QUESTIONS_VIRTUAL_DB_ID}-saved-questions`,
    ].forEach(url => {
      test("should open 'Saved Questions' database correctly", async ({ page }) => {
        await page.goto(url);
        await page.locator('text=Saved Questions');
        expect(await page.url()).toContain(url);
      });
    });
  });

  test.describe("dashboards", () => {
    test("should slugify dashboard URLs", async ({ page }) => {
      await page.goto("/collection/root");
      await page.locator('text=Orders in a dashboard').click();
      expect(await page.url()).toContain("/dashboard/1-orders-in-a-dashboard");
    });
  });

  test.describe("questions", () => {
    test("should slugify question URLs", async ({ page }) => {
      await page.goto("/collection/root");
      await page.locator('text=Orders').click();
      expect(await page.url()).toContain("/question/1-orders");
    });
  });

  test.describe("collections", () => {
    test("should slugify collection name", async ({ page }) => {
      await page.goto("/collection/root");
      await page.locator('text=First collection').click();
      expect(await page.url()).toContain("/collection/9-first-collection");
    });

    test("should slugify current user's personal collection name correctly", async ({ page }) => {
      await page.goto("/collection/root");
      await page.locator('text=Your personal collection').click();
      expect(await page.url()).toContain(`/collection/1-${getUsersPersonalCollectionSlug(admin)}`);
    });

    test("should not slugify users' collections page URL", async ({ page }) => {
      await page.goto("/collection/root");
      navigationSidebar().within(() => {
        cy.icon("ellipsis").click();
      });
      popover().findByText("Other users' personal collections").click();
      await page.locator('text=All personal collections');
      expect(await page.url()).toContain("/collection/users");
    });

    test("should slugify users' personal collection URLs", async ({ page }) => {
      await page.goto("/collection/users");
      await page.locator(`text=${getFullName(normal)}`).click();
      expect(await page.url()).toContain(`/collection/8-${getUsersPersonalCollectionSlug(normal)}`);
    });

    test("should open slugified URLs correctly", async ({ page }) => {
      await page.goto("/collection/9-first-collection");
      await expect(page.locator('[data-testid="collection-name-heading"]')).toHaveText("First collection");

      await page.goto(`/collection/1-${getUsersPersonalCollectionSlug(admin)}`);
      await expect(page.locator('[data-testid="collection-name-heading"]')).toHaveText(`${getFullName(admin)}'s Personal Collection`);

      await page.goto(`/collection/8-${getUsersPersonalCollectionSlug(normal)}`);
      await expect(page.locator('[data-testid="collection-name-heading"]')).toHaveText(`${getFullName(normal)}'s Personal Collection`);
    });
  });
});


function getUsersPersonalCollectionSlug(user) {
  const { first_name, last_name } = user;

  return `${first_name.toLowerCase()}-${last_name.toLowerCase()}-s-personal-collection`;
}
