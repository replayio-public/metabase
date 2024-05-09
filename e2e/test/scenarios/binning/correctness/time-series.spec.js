import {
  restore,
  popover,
  getBinningButtonForDimension,
  summarize,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { TIME_OPTIONS } from "./shared/constants";

const { ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "Test Question",
  query: {
    "source-table": ORDERS_ID,
    limit: 50,
  },
};

/**
 * The list of issues this spec covers:
 *  - metabase#11183
 *  -
 */
test.describe("scenarios > binning > correctness > time series", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.intercept("POST", "/api/dataset").as("dataset");

    cy.createQuestion(questionDetails, { visitQuestion: true });

    summarize();

    openPopoverFromDefaultBucketSize("Created At", "by month");
  });

  Object.entries(TIME_OPTIONS).forEach(
    ([bucketSize, { selected, representativeValues }]) => {
      test(`should return correct values for ${bucketSize}`, async ({ page }) => {
        await popover().within(() => {
          cy.findByText(bucketSize).click();
          cy.wait("@dataset");
        });

        getBinningButtonForDimension({
          name: "Created At",
          isSelected: true,
        }).should("have.text", selected);

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        cy.findByText("Done").click();

        getTitle(`Count by Created At: ${bucketSize}`);

        assertOnHeaderCells(bucketSize);
        assertOnTableValues(representativeValues);

        assertOnTimeSeriesFooter(bucketSize);
      });
    },
  );
});

function openPopoverFromDefaultBucketSize(name, bucket) {
  getBinningButtonForDimension({ name })
    .should("have.text", bucket)
    .click({ force: true });
}

async function getTitle(title, { page }) {
  await page.locator(`text=${title}`);
}

async function assertOnHeaderCells(bucketSize, { page }) {
  await page.locator(`.cellData >> text=Created At: ${bucketSize}`);
  await page.locator('.cellData >> text=Count');
}

async function assertOnTableValues(values, { page }) {
  for (const v of values) {
    await page.locator(`text=${v}`);
  }
}

async function assertOnTimeSeriesFooter(str, { page }) {
  await expect(page.locator('[data-testid="select-button-content"]').first()).toHaveText('All Time');
  await expect(page.locator('[data-testid="select-button-content"]').last()).toHaveText(str);
}
