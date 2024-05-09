import { restore, openNativeEditor } from "e2e/support/helpers";


test.describe("issue 21034", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    openNativeEditor();
    page.route(
      "GET",
      "/api/database/**/autocomplete_suggestions?**",
      (route) => route.continue(),
    ).as("suggestions");
  });

  test("should not invoke API calls for autocomplete twice in a row (metabase#18148)", async ({ page }) => {
    await page.locator(".ace_content").isVisible().type("p");

    // Wait until another explicit autocomplete is triggered
    // (slightly longer than AUTOCOMPLETE_DEBOUNCE_DURATION)
    // See https://github.com/metabase/metabase/pull/20970
    await page.waitForTimeout(1000);

    expect(await page.locator("@suggestions").callCount()).toEqual(1);
  });
});
