import {
  restore,
  visitQuestion,
  visitDashboard,
  openPeopleTable,
  describeEE,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE_ID } = SAMPLE_DATABASE;

test.describe("search > recently viewed", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    openPeopleTable();
    await findByTextEnsureVisible(page, "Address");

    // "Orders" question
    visitQuestion(1);

    // "Orders in a dashboard" dashboard
    visitDashboard(1);
    await findByTextEnsureVisible(page, "Product ID");

    // inside the "Orders in a dashboard" dashboard, the order is queried again,
    // which elicits a ViewLog entry

    await page.goto("/");

    await page.route(`/api/activity/recent_views`);
    await page.locator('input[placeholder="Search…"]').click();
    await page.waitForResponse(`/api/activity/recent_views`);

    await page.locator('[data-testid="loading-spinner"]').should("not.exist");
  });

  test("shows list of recently viewed items", async ({ page }) => {
    assertRecentlyViewedItem(
      page,
      0,
      "Orders in a dashboard",
      "Dashboard",
      "/dashboard/1-orders-in-a-dashboard",
    );
    assertRecentlyViewedItem(page, 1, "Orders", "Question", "/question/1-orders");
    assertRecentlyViewedItem(
      page,
      2,
      "People",
      "Table",
      `/question#?db=${SAMPLE_DB_ID}&table=${PEOPLE_ID}`,
    );
  });

  test("allows to select an item from keyboard", async ({ page }) => {
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Recently viewed");
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page.url()).toMatch(/\/question\/1-orders$/);
  });
});

describeEE("search > recently viewed > enterprise features", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await page.request("POST", "/api/moderation-review", {
      status: "verified",
      moderated_item_id: 1,
      moderated_item_type: "card",
    });

    visitQuestion(1);

    await page.locator('[data-testid="qb-header-left-side"]').locator(".Icon-verified");
  });

  test("should show verified badge in the 'Recently viewed' list (metabase#18021)", async ({ page }) => {
    await page.locator('input[placeholder="Search…"]').click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Recently viewed")
      .parent()
      .within(() => {
        page.locator("text=Orders").closest("a").locator(".Icon-verified");
      });
  });
});

const assertRecentlyViewedItem = (page, index, title, type, link) => {
  page.locator('[data-testid="recently-viewed-item"]')
    .nth(index)
    .parent()
    .should("have.attr", "href", link);

  page.locator('[data-testid="recently-viewed-item-title"]')
    .nth(index)
    .should("have.text", title);
  page.locator('[data-testid="recently-viewed-item-type"]')
    .nth(index)
    .should("have.text", type);
};
