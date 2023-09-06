import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "25156",
  query: {
    "source-table": REVIEWS_ID,
    aggregation: [["count"]],
    breakout: [
      ["field", REVIEWS.CREATED_AT, { "temporal-unit": "year" }],
      ["field", REVIEWS.RATING, null],
    ],
  },
  display: "bar",
  visualization_settings: {
    "graph.dimensions": ["CREATED_AT", "RATING"],
    "graph.metrics": ["count"],
    "graph.x_axis.scale": "linear",
  },
};

describe.skip("issue 25156", (() => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("should handle invalid x-axis scale (metabase#25156)", async ({ page }) => {
    createQuestion(questionDetails, { visitQuestion: true });

    await expect(page.locator(".bar")).toHaveCountAtLeast(20);
    await expect(page.locator(".x.axis .tick"))
      .toContainText("2016")
      .toContainText("2017")
      .toContainText("2018")
      .toContainText("2019")
      .toContainText("2020");
  });
});
