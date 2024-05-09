import { restore, popover, visualize, filter } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;
const CC_NAME = "City Length";

const questionDetails = {
  name: "14843",
  query: {
    "source-table": PEOPLE_ID,
    expressions: { [CC_NAME]: ["length", ["field", PEOPLE.CITY, null]] },
  },
};


test.describe("issue 14843", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("POST", "/api/dataset", { alias: "dataset" });
    await page.route("GET", `/api/database/${SAMPLE_DB_ID}/schema/PUBLIC`, { alias: "schema" });

    restore();
    cy.signInAsAdmin();
  });

  test('should correctly filter custom column by "Not equal to" (metabase#14843)', async ({ page }) => {
    await createQuestion(questionDetails, { visitQuestion: true });

    await page.locator('icon[name="notebook"]').click();

    await page.waitForResponse("@schema");

    filter({ mode: "notebook" });

    popover().findByText(CC_NAME).click();

    await page.locator(':text("Equal to")').click();
    await page.locator(':text("Not equal to")').click();

    await page.locator('input[placeholder="Enter a number"]').fill("3");
    await page.locator('button:text("Add filter")').click();

    visualize();

    await page.locator(`:text("${CC_NAME} is not equal to 3")`);
    await expect(page.locator(':text("Rye")')).not.toBeVisible();
  });
});

