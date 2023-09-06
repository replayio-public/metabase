import {
  restore,
  setupSMTP,
  visitQuestion,
  leftSidebar,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;

const multiSeriesQuestionWithGoal = {
  name: "multi",
  query: {
    "source-table": PEOPLE_ID,
    aggregation: [["count"]],
    breakout: [
      ["field", PEOPLE.SOURCE, null],
      [
        "field",
        PEOPLE.CREATED_AT,
        {
          "temporal-unit": "month",
        },
      ],
    ],
  },
  display: "line",
};

const timeSeriesQuestionId = 3;

const rawTestCases = [
  {
    questionType: "raw data question",
    questionId: 1,
  },
  {
    questionType: "timeseries question without a goal",
    questionId: timeSeriesQuestionId,
  },
];


test.describe("scenarios > alert > types", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    await test.intercept("POST", "/api/alert").as("savedAlert");

    restore();
    await test.signInAsAdmin();

    setupSMTP();
  });

  test.describe("rows based alerts", () => {
    rawTestCases.forEach(({ questionType, questionId }) => {
      test(`should be supported for ${questionType}`, async ({ page }) => {
        visitQuestion(questionId);

        openAlertModal();

        await page.locator('text=Done').click();

        const savedAlert = await test.waitForResponse("@savedAlert");
        expect(savedAlert.response.body.alert_condition).toEqual("rows");
      });
    });
  });

  test.describe("goal based alerts", () => {
    test("should work for timeseries questions with a set goal", async ({ page }) => {
      visitQuestion(timeSeriesQuestionId);

      await page.locator('text=Visualization').click();
      leftSidebar().within(() => {
        cy.icon("line").realHover();
        cy.icon("gear").click();
      });
      await page.locator('text=Line options');
      await page.locator('text=Display').click();

      setGoal("7000");

      await page.locator('text=Save').click();
      await page.locator('.Modal').locator('button:text=Save').click();
      await expect(page.locator('text=Save question')).not.toBeVisible();

      openAlertModal();

      await page.locator('text=Reaches the goal line').click();
      await page.locator('text=The first time').click();

      await page.locator('button:text=Done').click();

      const savedAlert = await test.waitForResponse("@savedAlert");
      expect(savedAlert.response.body.alert_condition).toEqual("goal");
      expect(savedAlert.response.body.alert_above_goal).toEqual(true);
      expect(savedAlert.response.body.alert_first_only).toEqual(true);
    });

    test("should not be possible to create goal based alert for a multi-series question", async ({ page }) => {
      cy.createQuestion(multiSeriesQuestionWithGoal, { visitQuestion: true });

      openAlertModal();

      await page.locator('text=Done').click();

      const savedAlert = await test.waitForResponse("@savedAlert");
      expect(savedAlert.response.body.alert_condition).toEqual("rows");
      expect(savedAlert.response.body.alert_above_goal).toEqual(null);
    });
  });
});



async function openAlertModal({ page }) {
  await page.locator('icon=bell').click();
  await page.locator('text=Set up an alert').click();
}



async function setGoal(goal, { page }) {
  await page.locator('text=Goal line').next().click();

  await page.locator('input[value="0"]').clear().type(goal);

  await page.locator('button:text=Done').click();
}

