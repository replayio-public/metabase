import {
  restore,
  popover,
  visualize,
  startNewQuestion,
  openOrdersTable,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS, REVIEWS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "22859-Q1",
  query: {
    "source-table": REVIEWS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field", REVIEWS.PRODUCT_ID, null],
          ["field", PRODUCTS.ID, { "join-alias": "Products" }],
        ],
        alias: "Products",
      },
    ],
  },
};


test.describe("issue 22859 - multiple levels of nesting", () => {
  test.beforeEach(async () => {
    await test.fixtures.restore();
    await test.fixtures.signInAsAdmin();

    const q1Id = await test.fixtures.createQuestion(questionDetails, { wrapId: true });

    // Join Orders table with the previously saved question and save it again
    openOrdersTable({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await test.page.click('text="Join data"');

    await test.page.locator('.Popover').within(async () => {
      await test.page.click('text="Sample Database"');
      await test.page.click('text="Saved Questions"');
      await test.page.click(`text="${questionDetails.name}"`);
    });

    await test.page.locator('.Popover').click('text="Product ID"');

    await test.page.locator('.Popover').click('text="Product ID"');

    visualize();

    const q2Id = await saveQuestion("22859-Q2");

    await test.page.waitForResponse(response => response.url().includes("/api/card"));

    getJoinedTableColumnHeader(q1Id);
  });

  test("model based on multi-level nested saved question should work (metabase#22859-1)", async ({ page }) => {
    const q2Id = await test.fixtures.getAlias("q2Id");

    // Convert the second question to a model
    await test.fixtures.request("PUT", `/api/card/${q2Id}`, { dataset: true });

    await page.goto(`/model/${q2Id}`);
    await page.waitForResponse(response => response.url().includes("/api/dataset"));

    getJoinedTableColumnHeader(q1Id);
  });

  test("third level of nesting with joins should result in proper column aliasing (metabase#22859-2)", async ({ page }) => {
    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Saved Questions"');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="22859-Q2"');

    visualize();

    getJoinedTableColumnHeader(q1Id);
  });
});



async function saveQuestion(name) {
  await test.page.click('text="Save"');
  await test.page.locator('input[value="Orders"]').clear().type(name).blur();

  await test.page.click('button:text("Save")');
  await test.page.click('button:text("Not now")');
}



function getJoinedTableColumnHeader(q1Id) {
  test.page.locator(`text="Question ${q1Id} → ID"`);
}

