import { restore, popover, openOrdersTable } from "e2e/support/helpers";


test.describe("issue 17712", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset");
    restore();
    await page.signInAsAdmin();
  });

  test("doesn't remove extra sections when removing a single section (metabase#17712)", async ({ page }) => {
    await openOrdersTable({ mode: "notebook" });

    await page.locator('text="Join data"').click();
    await popover().locator('text="Products"').click();
    await page.locator('[data-testid="step-join-0-0"] [data-testid="parent-dimension"]')
      .locator('icon="close"').click();

    await page.locator('[data-testid="action-buttons"] text="Join data"').click();
    await popover().locator('text="Reviews"').click();

    await page.locator('[data-testid="step-join-0-1"]').locator('icon="close"').click({ force: true });

    await page.locator('[data-testid="step-join-0-0"]').within(() => {
      page.locator('text="Orders"');
      page.locator('text="Products"');
      page.locator('text="ID"');
    });
  });
});

