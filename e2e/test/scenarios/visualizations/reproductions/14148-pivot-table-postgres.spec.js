import { restore, withDatabase, visitQuestionAdhoc } from "e2e/support/helpers";

const PG_DB_ID = 2;


test.describe("issue 14148", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    restore("postgres-12");
    cy.signInAsAdmin();
  });

  test("postgres should display pivot tables (metabase#14148)", async ({ page }) => {
    withDatabase(PG_DB_ID, ({ PEOPLE, PEOPLE_ID }) =>
      visitQuestionAdhoc(
        {
          display: "pivot",
          dataset_query: {
            type: "query",
            database: PG_DB_ID,
            query: {
              "source-table": PEOPLE_ID,
              aggregation: [["count"]],
              breakout: [
                ["field", PEOPLE.SOURCE, null],
                ["field", PEOPLE.CREATED_AT, { "temporal-unit": "year" }],
              ],
            },
          },
        },
        {
          callback: xhr =>
            expect(xhr.response.body.cause || "").not.to.contain("ERROR"),
        },
      ),
    );

    cy.log(
      "Reported failing on v0.38.0-rc1 querying Postgres, Redshift and BigQuery. It works on MySQL and H2.",
    );

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(/Grand totals/i);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("2,500");
  });
});

