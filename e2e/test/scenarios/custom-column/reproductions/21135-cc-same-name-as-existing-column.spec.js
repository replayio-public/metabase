import { restore } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "21135",
  query: {
    "source-table": PRODUCTS_ID,
    limit: 5,
    expressions: { Price: ["+", ["field", PRODUCTS.PRICE, null], 2] },
  },
};

test.describe("issue 21135", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    signInAsAdmin();

    createQuestion(questionDetails, { visitQuestion: true });

    switchToNotebookView();
  });

  test("should handle cc with the same name as the table column (metabase#21135)", async ({ page }) => {
    await page.locator('[data-testid="notebook-cell-item"]').findByText("Price").click();
    await page.locator('button').findByText("Update").click();

    previewCustomColumnNotebookStep();

    // We should probably use data-testid or some better selector but it is crucial
    // to narrow the results to the preview area to avoid false positive result.
    await page.locator('[data-testid="preview-root"]').within(async () => {
      await page.locator('text="Rustic Paper Wallet"');

      await expect(page.locator('text="Price"')).toHaveCount(2);

      await page.locator('text="29.46"'); // actual Price column
      await page.locator('text="31.46"'); // custom column
    });
  });
});

async function switchToNotebookView() {
  await page.route("GET", `/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`);

  await page.locator('icon="notebook"').click();
  await page.waitForResponse(`/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`);
}

async function previewCustomColumnNotebookStep() {
  await page.route("POST", "/api/dataset");

  await page.locator('[data-testid="step-expression-0-0"]').locator('.Icon-play').click();

  await page.waitForResponse("/api/dataset");
}
