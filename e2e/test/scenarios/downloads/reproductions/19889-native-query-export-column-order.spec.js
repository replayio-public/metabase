import { restore, downloadAndAssert, visitQuestion } from "e2e/support/helpers";

const questionDetails = {
  name: "19889",
  native: {
    query: 'select 1 "column a", 2 "column b", 3 "column c"',
  },
};

const testCases = ["csv", "xlsx"];

test.describe("issue 19889", () => {
  test.beforeEach(async () => {
    // Replace "cy.intercept" with Playwright's "route.fulfill" or "route.continue" depending on your use case
    // cy.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(questionDetails, {
      loadMetadata: true,
      wrapId: true,
    });

    // Reorder columns a and b
    // Replace the following block with Playwright's drag and drop functionality
    // await page.locator('text="column a"').dragAndDrop(page.locator('text="column b"'));
    // await page.locator('text="Started from"').click();
  });

  testCases.forEach(fileType => {
    test(`should order columns correctly in unsaved native query exports`, async () => {
      // Replace "downloadAndAssert" with Playwright's download functionality and assertions
    });

    test(`should order columns correctly in saved native query exports`, async () => {
      saveAndOverwrite();

      // Replace the following block with Playwright's download functionality and assertions
      // await page.locator('@questionId').then(questionId => {
      //   downloadAndAssert({ fileType, questionId, raw: true }, sheet => {
      //     expect(sheet["A1"].v).to.equal("column b");
      //     expect(sheet["B1"].v).to.equal("column a");
      //     expect(sheet["C1"].v).to.equal("column c");
      //   });
      // });
    });

    test(`should order columns correctly in saved native query exports when the query was modified but not re-run before save (#19889)`, async () => {
      // Replace the following block with Playwright's editor interaction and typing functionality
      // await page.locator('text=/open editor/i').click();
      // await page.locator('.ace_editor').type(
      //   '{selectall}select 1 "column x", 2 "column y", 3 "column c"',
      // );

      saveAndOverwrite();

      // Replace the following block with Playwright's download functionality and assertions
      // await page.locator('@questionId').then(questionId => {
      //   visitQuestion(questionId);
      //
      //   downloadAndAssert({ fileType, questionId, raw: true }, sheet => {
      //     expect(sheet["A1"].v).to.equal("column x");
      //     expect(sheet["B1"].v).to.equal("column y");
      //     expect(sheet["C1"].v).to.equal("column c");
      //   });
      // });
    });
  });
});

async function saveAndOverwrite() {
  await page.locator('text="Save"').click();
  await page.locator('button="Save"').click();
}
