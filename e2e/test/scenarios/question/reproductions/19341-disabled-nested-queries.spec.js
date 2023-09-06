import {
  restore,
  mockSessionProperty,
  popover,
  startNewQuestion,
} from "e2e/support/helpers";


test.describe("issue 19341", () => {
  const TEST_NATIVE_QUESTION_NAME = "Native";

  test.beforeEach(async ({ page }) => {
    restore();
    mockSessionProperty("enable-nested-queries", false);
    await signInAsAdmin(page);
    await createNativeQuestion({
      name: TEST_NATIVE_QUESTION_NAME,
      native: {
        query: "SELECT * FROM products",
      },
    });
    page.route("POST", "/api/card/*/query").as("cardQuery");
  });

  test("should correctly disable nested queries (metabase#19341)", async ({ page }) => {
    // Test "Saved Questions" table is hidden in QB data selector
    startNewQuestion();
    await popover().within(async () => {
      // Wait until picker init
      // When working as expected, the test environment only has "Sample Database" DB
      // So it should automatically select it as a database
      // When "Orders" table name appears, it means the picker has selected the sample database
      await page.locator("text=Loading...").should("not.exist");
      await page.locator("text=Orders");

      await page.locator("text=Sample Database").click(); // go back to DB list
      await page.locator("text=Saved Questions").should("not.exist");

      // Ensure the search doesn't list saved questions
      await page.locator("input[placeholder='Search for a table…']").type("Ord");
      await page.locator("text=Loading...").should("not.exist");
      await page.locator("text=/Saved question in/i").should("not.exist");
      await page.locator("text=/Table in/i").should("exist");
      await page.locator("icon=close").click();

      await page.locator("text=Sample Database").click();
      await page.locator("text=Orders").click();
    });

    await page.locator("icon=join_left_outer").click();
    await popover().within(async () => {
      await page.locator("text=Sample Database").click(); // go back to DB list
      await page.locator("text=Saved Questions").should("not.exist");
    });

    // Test "Explore results" button is hidden for native questions
    await page.goto("/collection/root");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=TEST_NATIVE_QUESTION_NAME").click();
    await page.waitForResponse("@cardQuery");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator("text=Explore results").should("not.exist");
  });
});

