import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "25908",
  query: {
    "source-table": PRODUCTS_ID,
  },
};

const dashboardFilter = {
  name: "Text contains",
  slug: "text_contains",
  id: "28c6ada9",
  type: "string/contains",
  sectionId: "string",
};

const dashboardDetails = {
  parameters: [dashboardFilter],
};

const CASE_INSENSITIVE_ROWS = 30;


test.describe("issue 25908", () => {
  test.beforeEach(async ({ context }) => {
    // Replace "cy" with "context" and add "await" before the function calls
    await context.intercept("POST", "/api/dataset").as("dataset");

    restore();
    await context.signInAsAdmin();

    await context.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
      async ({ body: { id, card_id, dashboard_id } }) => {
        await context.intercept(
          "POST",
          `/api/dashboard/${dashboard_id}/dashcard/${id}/card/${card_id}/query`,
        ).as("dashcardQuery");

        await context.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
          cards: [
            {
              id,
              card_id,
              row: 0,
              col: 0,
              size_x: 13,
              size_y: 8,
              series: [],
              visualization_settings: {},
              parameter_mappings: [
                {
                  parameter_id: dashboardFilter.id,
                  card_id,
                  target: ["dimension", ["field", PRODUCTS.TITLE, null]],
                },
              ],
            },
          ],
        });

        // Note the capital first letter
        await context.visit(`/dashboard/${dashboard_id}?text_contains=Li`);
        await context.wait("@dashcardQuery");
        await context.contains(new RegExp(`^Rows 1-\\d+ of ${CASE_INSENSITIVE_ROWS}$`));
      },
    );
  });

  test("`contains` dashboard filter should respect case insensitivity on a title-drill-through (metabase#25908)", async ({ context }) => {
    // Replace "cy" with "context" and add "await" before the function calls
    await context.findByText(questionDetails.name).click();
    await context.wait("@dataset");

    await context.findByText("Title contains Li");
    await context.findByText(`Showing ${CASE_INSENSITIVE_ROWS} rows`);
  });
});

