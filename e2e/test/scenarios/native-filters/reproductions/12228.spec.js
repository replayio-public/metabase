import { restore } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS } = SAMPLE_DATABASE;

const filter = {
  id: "6b8b10ef-0104-1047-1e1b-2492d5954322",
  name: "created_at",
  "display-name": "Created at",
  type: "dimension",
  dimension: ["field", ORDERS.CREATED_AT, null],
  "widget-type": "date/month-year",
};

const nativeQuery = {
  name: "12228",
  native: {
    query: "select count(*) from orders where {{created_at}}",
    "template-tags": {
      created_at: filter,
    },
  },
  display: "scalar",
};


test.describe("issue 12228", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
  });

  test("can load a question with a date filter (metabase#12228)", async ({ page }) => {
    const { id } = await cy.createNativeQuestion(nativeQuery);
    await page.goto(`/question/${id}?created_at=2020-01`);
    await expect(page.locator('text=580')).toBeVisible();
  });
});
