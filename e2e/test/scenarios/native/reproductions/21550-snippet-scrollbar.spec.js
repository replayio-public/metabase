import { restore, modal, openNativeEditor } from "e2e/support/helpers";


test.describe("issue 21550", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await page.context().addInitScript(signInAsAdmin);

    await page.route("GET", "/api/collection/root/items?**");
    await page.route("GET", "/api/native-query-snippet/**");
  });

  test("should not show scrollbars for very short snippet (metabase#21550)", async ({ page }) => {
    await openNativeEditor(page);

    await page.locator('text="snippet"').click();
    await page.waitForResponse("/api/collection/root/items?**");
    await page.locator('text="Create a snippet"').click();

    await modal(page).within(async () => {
      await page.locator('input[aria-label="Enter some SQL here so you can reuse it later"]').fill(
        "select * from people",
      );
      await page.locator('input[aria-label="Give your snippet a name"]').fill("people");
      await page.locator('text="Save"').click();
      await page.waitForResponse("/api/collection/root/items?**");
    });

    await page.locator('text="people"').hover();
    await page.locator('.Icon-chevrondown').click({ force: true });

    const preElement = await page.locator("pre").first();
    const preWidth = await preElement.boundingBox();
    const clientWidth = await preElement.evaluate((el) => el.clientWidth);
    const BORDERS = 2; // 1px left and right
    expect(clientWidth).toBeGreaterThanOrEqual(preWidth - BORDERS);
  });
});

