import {
  restore,
  visitQuestionAdhoc,
  popover,
  visualize,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;

const questionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    query: {
      "source-table": PEOPLE_ID,
      aggregation: [["max", ["field", PEOPLE.NAME, null]]],
      breakout: [["field", PEOPLE.SOURCE, null]],
    },
    type: "query",
    display: "table",
  },
};


test.describe("issue 22230", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(questionDetails, { mode: "notebook" });
  });

  test("should be able to filter on an aggregation (metabase#22230)", async ({ page }) => {
    await page.locator('text="Filter"').click();
    popover().contains("Max of Name").click();
    await page.locator('[data-testid="select-button"]').click();
    await page.locator('text="Starts with"').click();

    await page.locator('input[placeholder="Enter some text"]').fill("Zo").blur();
    await page.locator('button:text("Add filter")').click();

    visualize();
    await expect(page.locator('text="Showing 2 rows"')).toBeVisible();
    await expect(page.locator('text="Zora Schamberger"')).toBeVisible();
    await expect(page.locator('text="Zoie Kozey"')).toBeVisible();
  });
});

