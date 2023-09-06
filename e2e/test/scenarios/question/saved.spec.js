import {
  restore,
  popover,
  modal,
  openOrdersTable,
  summarize,
  visitQuestion,
  openQuestionActions,
  questionInfoButton,
  rightSidebar,
  appBar,
  getCollectionIdFromSlug,
} from "e2e/support/helpers";

test.describe("scenarios > question > saved", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsNormalUser();
  });

  test('should should correctly display "Save" modal (metabase#13817)', async ({ page }) => {
    await openOrdersTable();
    await page.locator('icon("notebook")').click();
    await summarize({ mode: "notebook" });
    await page.locator('text("Count of rows")').click();
    await page.locator('text("Pick a column to group by")').click();
    await popover().findByText("Total").click();
    await page.locator('text("Save")').click();
    await modal().within(async () => {
      await page.locator('text("Save")').click();
    });
    await page.locator('text("Not now")').click();
    await page.locator('text("Save")').should("not.exist");

    await page.locator('text("Filter")').click();
    await popover()
      .findByText(/^Total$/)
      .click();
    await page.locator('text("Equal to")').click();
    await page.locator('text("Greater than")').click();
    await page.locator('input[placeholder="Enter a number"]').type("60");
    await page.locator('text("Add filter")').click();

    await page.locator('text("Save")').click();

    await modal().within(async () => {
      await page.locator('text("Save question")');
      await page.locator('button("Save")').as("saveButton");
      await page.locator('@saveButton').should("not.be.disabled");

      await page.locator('text("Save as new question")').click();
      await page.locator('input[label="Name"]')
        .click()
        .type("{selectall}{backspace}", { delay: 50 })
        .blur();
      await page.locator('input[label="Name: required"]').should("be.empty");
      await page.locator('input[label="Description"]').should("be.empty");
      await page.locator('@saveButton').should("be.disabled");

      await page.locator('text(/^Replace original question,/)').click();
      await page.locator('@saveButton').should("not.be.disabled");
    });
  });

  // Other tests are omitted for brevity
});
