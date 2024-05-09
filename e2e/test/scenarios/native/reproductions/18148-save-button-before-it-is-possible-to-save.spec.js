import { restore, openNativeEditor } from "e2e/support/helpers";

const dbName = "Sample2";


test.describe("issue 18148", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await addH2SampleDatabase({
      name: dbName,
    });

    openNativeEditor();
  });

  test("should not offer to save the question before it is actually possible to save it (metabase#18148)", async ({ page }) => {
    await expect(page.locator('text=Select a database')).toBeVisible();
    await expect(page.locator('text=Save')).toHaveAttribute("aria-disabled", "true");

    await page.locator(`text=${dbName}`).click();

    await page.locator('.ace_content').type("select foo");

    await page.locator('text=Save').click();

    await expect(page.locator('.Modal')).toBeVisible();
  });
});

