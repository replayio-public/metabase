import { onlyOn } from "@cypress/skip-test";
import {
  restore,
  visitDashboard,
  saveDashboard,
  visitQuestion,
  questionInfoButton,
  rightSidebar,
  openQuestionsSidebar,
} from "e2e/support/helpers";

const PERMISSIONS = {
  curate: ["admin", "normal", "nodata"],
  view: ["readonly"],
  no: ["nocollection", "nosql", "none"],
};

test.describe("revision history", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/revision/revert").as("revert");

    restore();
  });

  test.describe("reproductions", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsAdmin(page);
    });

    test("shouldn't render revision history steps when there was no diff (metabase#1926)", async ({ page }) => {
      const dashboardId = await createDashboard(page);
      await visitAndEditDashboard(page, dashboardId);

      // Save the dashboard without any changes made to it (TODO: we should probably disable "Save" button in the first place)
      await saveDashboard(page);
      await page.locator('icon[name="pencil"]').click();
      await saveDashboard(page);

      await openRevisionHistory(page);

      await page.locator('text=/created this/');

      await expect(page.locator('text="Revert"')).not.toBeVisible();
    });
  });

  // ... rest of the tests
});

async function clickRevert(page, event_name, index = 0) {
  await page.locator(`text=${event_name}`).nth(index).click();
}

async function visitAndEditDashboard(page, id) {
  await visitDashboard(page, id);
  await page.locator('icon[name="pencil"]').click();
}

async function openRevisionHistory(page) {
  await page.route("GET", "/api/revision*").as("revisionHistory");
  await page.locator("main header").within(async () => {
    await page.locator('icon[name="info"]').click();
  });
  await page.waitForResponse("@revisionHistory");

  await page.locator('text="History"');
  await expect(page.locator('[data-testid="dashboard-history-list"]')).toBeVisible();
}
