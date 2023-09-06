import {
  restore,
  visualize,
  withDatabase,
  adhocQuestionHash,
  summarize,
} from "e2e/support/helpers";

const MONGO_DB_ID = 2;


test.describe("issue 13097", { tags: "@external" }, () => {
  test.beforeEach(async ({ page }) => {
    restore("mongo-4");
    cy.signInAsAdmin();

    withDatabase(MONGO_DB_ID, ({ PEOPLE_ID }) => {
      const questionDetails = {
        dataset_query: {
          type: "query",
          query: { "source-table": PEOPLE_ID, limit: 5 },
          database: MONGO_DB_ID,
        },
      };

      const hash = adhocQuestionHash(questionDetails);

      cy.visit(`/question/notebook#${hash}`);
    });
  });

  test("should correctly apply distinct count on multiple columns (metabase#13097)", async ({ page }) => {
    summarize({ mode: "notebook" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Number of distinct values of ...").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("City").click();

    cy.findAllByTestId("notebook-cell-item").find(".Icon-add").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Number of distinct values of ...").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("State").click();

    visualize();

    // cy.log("Reported failing on stats ~v0.36.3");
    await expect(page.locator(".cellData"))
      .toHaveCount(4)
      .and("contain", "Distinct values of City")
      .and("contain", "1,966")
      .and("contain", "Distinct values of State")
      .and("contain", "49");
  });
});
