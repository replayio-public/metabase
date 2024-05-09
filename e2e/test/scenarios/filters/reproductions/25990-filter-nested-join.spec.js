import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    type: "query",
    database: SAMPLE_DB_ID,
    query: {
      "source-query": {
        "source-table": ORDERS_ID,
        joins: [
          {
            fields: "all",
            "source-table": PEOPLE_ID,
            condition: [
              "=",
              ["field", ORDERS.USER_ID, null],
              ["field", PEOPLE.ID, { "join-alias": "People - User" }],
            ],
            alias: "People - User",
          },
        ],
        aggregation: [["count"]],
        breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
      },
      filter: [">", ["field", "count", { "base-type": "type/Integer" }], 0],
    },
  },
};


test.describe("issue 25990", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.route("POST", `/api/dataset`, { times: 1 });
  });

  test("should allow to filter by a column in a joined table (metabase#25990)", async ({ page }) => {
    visitQuestionAdhoc(questionDetails);

    await page.locator('text=Filter').click();
    await page.locator('text=People - User').click();
    await page.locator('input[placeholder="Enter an ID"]').fill("10");
    await page.locator('button:text("Apply Filters")').click();
    await page.waitForResponse("POST", `/api/dataset`);

    await expect(page.locator('text=ID is 10')).toBeVisible();
  });
});

