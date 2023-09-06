import {
  restore,
  withDatabase,
  popover,
  openSeriesSettings,
} from "e2e/support/helpers";

const externalDatabaseId = 2;

test.describe("issue 16170", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore("mongo-4");
    cy.signInAsAdmin();

    withDatabase(externalDatabaseId, ({ ORDERS, ORDERS_ID }) => {
      const questionDetails = {
        name: "16170",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "year" }]],
        },
        database: externalDatabaseId,
        display: "line",
      };

      cy.createQuestion(questionDetails, { visitQuestion: true });
    });
  });

  ["Zero", "Nothing"].forEach(replacementValue => {
    test(`replace missing values with "${replacementValue}" should work on Mongo (metabase#16170)`, async () => {
      await page.locator('[data-testid="viz-settings-button"]').click();

      openSeriesSettings("Count");

      replaceMissingValuesWith(replacementValue);

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Done")').click();

      assertOnTheYAxis();

      await page.locator('.dot').nth(-2).hover();

      popover().within(() => {
        testPairedTooltipValues("Created At", "2019");
        testPairedTooltipValues("Count", "6,524");
      });
    });
  });
});

async function replaceMissingValuesWith(value) {
  await page.locator(':text("Replace missing values with")').parent().locator('[data-testid="select-button"]').click();

  popover().locator(':text("'+value+'")').click();
}

async function assertOnTheYAxis() {
  await page.locator('.y-axis-label').locator(':text("Count")');

  await expect(page.locator('.axis.y .tick')).toHaveCount({ gte: 10 }).and('contain', "6,000");
}

async function testPairedTooltipValues(val1, val2) {
  await page.locator(':text("'+val1+'")').closest('td').sibling('td').locator(':text("'+val2+'")');
}
