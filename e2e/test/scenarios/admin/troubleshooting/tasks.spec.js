import { restore } from "e2e/support/helpers";

const total = 57;
const limit = 50;

test.describe("scenarios > admin > troubleshooting > tasks", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    // The only reliable way to reproduce this issue is by stubing page responses!
    // All previous attempts to generate enough real tasks (more than 50)
    // resulted in flaky and unpredictable tests.
    stubPageResponses({ page: 0, alias: "first" });
    stubPageResponses({ page: 1, alias: "second" });
  });

  test("pagination should work (metabase#14636)", async ({ page }) => {
    await page.goto("/admin/troubleshooting/tasks");
    await page.waitForResponse("@first");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Troubleshooting logs")).toBeVisible();
    const previous = page.locator('[aria-label="Previous page"]');
    const next = page.locator('[aria-label="Next page"]');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=1 - 50")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=field values scanning")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=513")).toBeVisible();

    await shouldBeDisabled(previous);
    await shouldNotBeDisabled(next);

    await next.click();
    await page.waitForResponse("@second");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(`text=51 - ${total}`)).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=1 - 50")).toBeHidden();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=analyze")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=200")).toBeVisible();

    await shouldNotBeDisabled(previous);
    await shouldBeDisabled(next);
  });
});

async function shouldNotBeDisabled(selector) {
  await expect(selector).toBeEnabled();
}

async function shouldBeDisabled(selector) {
  await expect(selector).toBeDisabled();
}

/**
 * @param {Object} payload
 * @param {(0|1)} payload.page
 * @param {("first"|"second")} payload.alias
 */
function stubPageResponses({ page, alias }) {
  const offset = page * limit;

  cy.intercept("GET", `/api/task?limit=${limit}&offset=${offset}`, req => {
    req.reply(res => {
      res.body = {
        data: stubPageRows(page),
        limit,
        offset,
        total,
      };
    });
  }).as(alias);
}

/**
 * @typedef {Object} Row
 *
 * @param {(0|1)} page
 * @returns Row[]
 */
function stubPageRows(page) {
  // There rows details don't really matter.
  // We're generating two types of rows. One for each page.
  const tasks = ["field values scanning", "analyze"];
  const durations = [513, 200];

  /** type: {Row} */
  const row = {
    id: page + 1,
    task: tasks[page],
    db_id: 1,
    started_at: "2023-03-04T01:45:26.005475-08:00",
    ended_at: "2023-03-04T01:45:26.518597-08:00",
    duration: durations[page],
    task_details: null,
    name: `Item $page}`,
    model: "card",
  };

  const pageRows = [limit, total - limit];
  const length = pageRows[page];

  const stubbedRows = Array.from({ length }, () => row);
  return stubbedRows;
}
