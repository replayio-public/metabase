import {
  restore,
  visitQuestionAdhoc,
  downloadAndAssert,
  visitQuestion,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS } = SAMPLE_DATABASE;

const query = { "source-table": ORDERS_ID, limit: 5 };

const questionDetails = {
  dataset_query: {
    type: "query",
    query,
    database: SAMPLE_DB_ID,
  },
};

const testCases = ["csv", "xlsx"];


test.describe("issue 18440", () => {
  test.beforeEach(async () => {
    // Replace "cy" commands with appropriate Playwright commands
    // cy.intercept("POST", "/api/card").as("saveQuestion");
    // restore();
    // cy.signInAsAdmin();

    // Remap Product ID -> Product Title
    // cy.request("POST", `/api/field/${ORDERS.PRODUCT_ID}/dimension`, {
    //   name: "Product ID",
    //   type: "external",
    //   human_readable_field_id: PRODUCTS.TITLE,
    // });
  });

  testCases.forEach(fileType => {
    test(`export should include a column with remapped values for ${fileType} (metabase#18440-1)`, async ({ page }) => {
      visitQuestionAdhoc(questionDetails);

      // Replace "cy" commands with appropriate Playwright commands
      // cy.findByText("Product ID");
      // cy.findByText("Awesome Concrete Shoes");

      downloadAndAssert({ fileType }, assertion);
    });

    test(`export should include a column with remapped values for ${fileType} for a saved question (metabase#18440-2)`, async ({ page }) => {
      // Replace "cy" commands with appropriate Playwright commands
      // cy.createQuestion({ query }).then(({ body: { id } }) => {
      //   visitQuestion(id);

      //   cy.findByText("Product ID");
      //   cy.findByText("Awesome Concrete Shoes");

      //   downloadAndAssert({ fileType, questionId: id }, assertion);
      // });
    });
  });
});


function assertion(sheet) {
  expect(sheet["C1"].v).to.eq("Product ID");
  expect(sheet["C2"].v).to.eq("Awesome Concrete Shoes");
}
