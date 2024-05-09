import {
  restore,
  openOrdersTable,
  popover,
  visualize,
  summarize,
} from "e2e/support/helpers";


test.describe("issue 17512", () => {
  test.beforeEach(async ({ context }) => {
    context.intercept("POST", "/api/dataset").as("dataset");

    restore();
    await cy.signInAsAdmin();
  });

  test('custom expression should work with `case` in nested queries (metabase#17512)', async () => {
    openOrdersTable({ mode: "notebook" });

    addSummarizeCustomExpression(
      "Distinct(case([Discount] > 0, [Subtotal], [Total]))",
      "CE",
    );

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("Pick a column to group by").click();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("Created At").click();

    addCustomColumn("1 + 1", "CC");

    visualize(({ body }) => {
      expect(body.error).to.not.exist;
    });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("CE");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await cy.findByText("CC");
  });
});

async function addSummarizeCustomExpression(formula, name) {
  summarize({ mode: "notebook" });
  await popover().contains("Custom Expression").click();

  await popover().within(async () => {
    await cy.get(".ace_text-input").type(formula).blur();
    await cy.findByPlaceholderText("Something nice and descriptive").type(name);
    await cy.button("Done").click();
  });
}

async function addCustomColumn(formula, name) {
  await cy.findByText("Custom column").click();
  await popover().within(async () => {
    await cy.get(".ace_text-input").type(formula).blur();
    await cy.findByPlaceholderText("Something nice and descriptive").type(name);
    await cy.button("Done").click();
  });
}
