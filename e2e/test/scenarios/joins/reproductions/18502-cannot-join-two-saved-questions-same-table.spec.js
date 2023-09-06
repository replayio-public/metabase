import {
  restore,
  popover,
  visualize,
  startNewQuestion,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;

const question1 = getQuestionDetails("18502#1", PEOPLE.CREATED_AT);
const question2 = getQuestionDetails("18502#2", PEOPLE.BIRTH_DATE);


test.describe("issue 18502", () => {
  test.beforeEach(async () => {
    await test.intercept("POST", "/api/dataset").as("dataset");
    restore();
    await test.signInAsAdmin();
  });

  test('should be able to join two saved questions based on the same table (metabase#18502)', async ({ page }) => {
    await test.intercept("GET", "/api/collection/*/items?*").as("getCollectionContent");

    await test.createQuestion(question1);
    await test.createQuestion(question2);

    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Saved Questions"');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="18502#1"');
    await page.click('icon="join_left_outer"');
    await test.waitFor("@getCollectionContent");

    popover().within(async () => {
      await page.click('text="Saved Questions"');
      await page.click('text="18502#2"');
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Created At"');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Birth Date"');

    visualize(response => {
      expect(response.body.error).to.not.exist;
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="April, 2016"');
  });
});


function getQuestionDetails(name, breakoutColumn) {
  return {
    name,
    query: {
      "source-table": PEOPLE_ID,
      aggregation: [["count"]],
      breakout: [["field", breakoutColumn, { "temporal-unit": "month" }]],
    },
  };
}
