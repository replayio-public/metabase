import {
  restore,
  popover,
  visualize,
  startNewQuestion,
} from "e2e/support/helpers";

const MYSQL_DB_NAME = "QA MySQL8";


test.describe("issue 15342", { tags: "@external" }, () => {
  test.beforeEach(() => {
    restore("mysql-8");
    cy.signInAsAdmin();

    cy.viewport(4000, 1200); // huge width required so three joined tables can fit
  });

  test("should correctly order joins for MySQL queries (metabase#15342)", async ({ page }) => {
    startNewQuestion();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click(`text=${MYSQL_DB_NAME}`);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=People");

    addJoin({
      leftColumn: "ID",
      rightTable: "Orders",
      rightColumn: "Product ID",
    });

    addJoin({
      leftTable: "Orders",
      leftColumn: "Product ID",
      rightTable: "Products",
      rightColumn: "ID",
      joinType: "inner",
    });

    visualize();

    await page.locator(".Visualization").within(() => {
      page.locator("text=Email"); // from People table
      page.locator("text=Orders → ID"); // joined Orders table columns
      page.locator("text=Products → ID"); // joined Products table columns
    });
  });
});

function selectFromDropdown(itemName) {
  return popover().findByText(itemName);
}

const JOIN_LABEL = {
  left: "Left outer join",
  right: "Right outer join",
  inner: "Inner join",
};

async function addJoin({
  leftTable,
  leftColumn,
  rightTable,
  rightColumn,
  joinType = "left",
} = {}) {
  await page.locator('icon[name="join_left_outer"]').last().click();

  await selectFromDropdown(rightTable).click();

  if (leftTable) {
    await selectFromDropdown(leftTable).click();
  }

  await selectFromDropdown(leftColumn).click();
  await selectFromDropdown(rightColumn).click();

  await page.locator('text=Join data')
    .last()
    .next()
    .within(() => {
      page.locator('icon[name="join_left_outer"]').click();
    });
  await selectFromDropdown(JOIN_LABEL[joinType]).click();
}
