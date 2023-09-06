import {
  restore,
  describeEE,
  visitQuestion,
  questionInfoButton,
  rightSidebar,
  popover,
} from "e2e/support/helpers";

describeEE("scenarios > question > caching", test.describe("scenarios > question > caching", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.request("PUT", "/api/setting/enable-query-caching", { value: true });
  });

  test("can set cache ttl for a saved question", async ({ page }) => {
    await page.route("PUT", "/api/card/1", { times: 2 });
    visitQuestion(1);

    questionInfoButton().click();

    rightSidebar().within(() => {
      page.locator("text=Cache Configuration").click();
    });

    popover().within(() => {
      page.locator("input[placeholder='24']").fill("48").blur();
      page.locator("button:text('Save changes')").click();
    });

    await page.waitForResponse("/api/card/1");
    page.locator("button:text(/Saved/)");

    await page.reload();

    questionInfoButton().click();

    rightSidebar().within(() => {
      page.locator("text=Cache Configuration").click();
    });

    popover().within(() => {
      page.locator("input[value='48']").fill("0").blur();
      page.locator("button:text('Save changes')").click();
    });

    await page.waitForResponse("/api/card/1");
    page.locator("button:text(/Saved/)");

    await page.reload();

    questionInfoButton().click();

    rightSidebar().within(() => {
      page.locator("text=Cache Configuration").click();
    });

    popover().within(() => {
      page.locator("input[placeholder='24']");
    });
  });
}));
