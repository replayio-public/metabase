import { restore, filterWidget } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS } = SAMPLE_DATABASE;

const filter = {
  id: "a3b95feb-b6d2-33b6-660b-bb656f59b1d7",
  name: "filter",
  "display-name": "Filter",
  type: "dimension",
  dimension: ["field", ORDERS.CREATED_AT, null],
  "widget-type": "date/all-options",
  default: null,
};

const nativeQuery = {
  name: "26861",
  native: {
    query: "select * from orders where {{filter}} limit 2",
    "template-tags": {
      filter,
    },
  },
};

describe.skip("issue 26861", (() => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", "/api/dataset").as("dataset");

    restore();
    await signInAsAdmin();

    await createNativeQuestion(nativeQuery, { visitQuestion: true });
  });

  test('exclude filter shouldn\'t break native questions with field filters (metabase#26861)', async ({ page }) => {
    await filterWidget().click();
    await page.locator('text="Exclude..."').click();

    await page.locator('text="Days of the week..."').click();
    await page.locator('text="Tuesday"').click();

    await page.locator('text="Update filter"').click();
    await page.waitForResponse("@dataset");

    await expect(page.locator('text="CREATED_AT excludes Tuesday"')).toBeVisible();
    await expect(page.locator('text="117.03"')).not.toBeVisible();
  });
}));
