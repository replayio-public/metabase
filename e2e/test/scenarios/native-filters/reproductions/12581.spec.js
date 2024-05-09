import { restore, modal, filterWidget } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS } = SAMPLE_DATABASE;

const ORIGINAL_QUERY = "SELECT * FROM ORDERS WHERE {{filter}} LIMIT 2";

const filter = {
  id: "a3b95feb-b6d2-33b6-660b-bb656f59b1d7",
  name: "filter",
  "display-name": "Filter",
  type: "dimension",
  dimension: ["field", ORDERS.CREATED_AT, null],
  "widget-type": "date/month-year",
  default: null,
};

const nativeQuery = {
  name: "12581",
  native: {
    query: ORIGINAL_QUERY,
    "template-tags": {
      filter,
    },
  },
};


test.describe("issue 12581", () => {
  test.beforeEach(async () => {
    test.intercept("POST", "/api/dataset").as("dataset");

    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestion(nativeQuery, { visitQuestion: true });
  });

  test('should correctly display a revision state after a restore (metabase#12581)', async ({ page }) => {
    // Start with the original version of the question made with API
    await page.locator(/Open Editor/i).click();
    await expect(page.locator(/Open Editor/i)).not.toBeVisible();

    // Both delay and a repeated sequence of `{selectall}{backspace}` are there to prevent typing flakes
    // Without them at least 1 in 10 test runs locally didn't fully clear the field or type correctly
    await page.locator(".ace_content")
      .as("editor")
      .click()
      .type("{selectall}{backspace}", { delay: 50 });
    await page.locator("@editor").click().type("{selectall}{backspace}SELECT 1");

    await page.locator("Save").click();
    modal().within(() => {
      cy.button("Save").click();
    });

    await page.reload();
    await test.waitForResponse("@cardQuery");

    await page.locator('[data-testid="revision-history-button"]').click();
    // Make sure sidebar opened and the history loaded
    await expect(page.locator(/You created this/i)).toBeVisible();

    await page.locator('[data-testid="question-revert-button"]').click(); // Revert to the first revision
    await test.waitForResponse("@dataset");

    await expect(page.locator(/You reverted to an earlier version/i)).toBeVisible();
    await page.locator(/Open Editor/i).click();

    cy.log("Reported failing on v0.35.3");
    await expect(page.locator("@editor")).toBeVisible().and("contain", ORIGINAL_QUERY);

    await expect(page.locator("37.65")).toBeVisible();

    // Filter dropdown field
    filterWidget().contains("Filter");
  });
});

