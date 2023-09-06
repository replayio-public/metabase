import { restore, visitQuestionAdhoc, popover } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const questionDetails = {
  name: "27279",
  native: {
    query:
      "select -3 o, 'F2021' k, 1 v\nunion all select -2, 'V2021', 2\nunion all select -1, 'S2022', 3\nunion all select 0, 'F2022', 4",
    "template-tags": {},
  },
  visualization_settings: {
    "table.pivot_column": "O",
    "table.cell_column": "V",
  },
};


test.describe("issue 27279", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test('should reflect/apply sorting to the x-axis (metabase#27279)', async ({ page }) => {
    const questionId = await createNativeQuestion(page, questionDetails);
    await visitQuestionAdhoc(page, {
      dataset_query: {
        type: "query",
        query: {
          "source-table": `card__${questionId}`,
          aggregation: [
            ["sum", ["field", "V", { "base-type": "type/Integer" }]],
          ],
          breakout: [
            ["field", "K", { "base-type": "type/Text" }],
            ["field", "O", { "base-type": "type/Integer" }],
          ],
          "order-by": [
            ["asc", ["field", "O", { "base-type": "type/Integer" }]],
          ],
        },
        database: SAMPLE_DB_ID,
      },
      display: "bar",
      visualization_settings: {
        "graph.dimensions": ["K", "O"],
        "graph.metrics": ["sum"],
      },
    });

    const legendItems = ["-3", "-2", "-1", "0"];
    await compareValuesInOrder(page.locator('[data-testid="legend-item"]'), legendItems);

    const xAxisTicks = ["F2021", "V2021", "S2022", "F2022"];
    await compareValuesInOrder(page.locator('.x.axis .tick'), xAxisTicks);

    // Extra step, just to be overly cautious
    await page.locator(".bar").first().hover();
    await popover().within(() => {
      testPairedTooltipValues("K", "F2021");
      testPairedTooltipValues("O", "-3");
      testPairedTooltipValues("Sum of V", "1");
    });

    await page.locator(".bar").last().hover();
    await popover().within(() => {
      testPairedTooltipValues("K", "F2022");
      testPairedTooltipValues("O", "0");
      testPairedTooltipValues("Sum of V", "4");
    });
  });
});



async function compareValuesInOrder(selector, values) {
  for (let index = 0; index < values.length; index++) {
    await expect(selector.nth(index)).toHaveText(values[index]);
  }
}



function testPairedTooltipValues(val1, val2) {
  cy.contains(val1).closest("td").siblings("td").findByText(val2);
}

