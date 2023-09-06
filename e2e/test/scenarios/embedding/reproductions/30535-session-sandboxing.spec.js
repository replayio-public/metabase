import { restore, visitQuestion, describeEE } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "3035",
  query: {
    "source-table": PRODUCTS_ID,
    limit: 10,
  },
};

describeEE("issue 30535", test(() => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.sandboxTable({
      table_id: PRODUCTS_ID,
      attribute_remappings: {
        attr_cat: ["dimension", ["field", PRODUCTS.CATEGORY, null]],
      },
    });

    cy.createQuestion(questionDetails).then(({ body: { id } }) => {
      cy.request("PUT", `/api/card/${id}`, { enable_embedding: true });

      visitQuestion(id);
    });
  });

  test("user session should not apply sandboxing to a signed embedded question (metabase#30535)", async ({ page }) => {
    await page.locator('icon[name="share"]').click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="Embed in your application"').click();

    const iframe = await page.locator("iframe");

    cy.signOut();
    cy.signInAsSandboxedUser();

    await page.goto(iframe.src);

    await page.locator('role="table"').within(() => {
      // The sandboxed user has an attribute cat="Widget"
      await page.locator('text="Widget"');
      // Sandboxing shouldn't affect results so we should see other product categories as well
      await page.locator('text="Gizmo"');
    });
  });
}));
