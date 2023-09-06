import {
  restore,
  visualize,
  popover,
  openOrdersTable,
} from "e2e/support/helpers";


test.describe("issue 29795", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should allow join based on native query (metabase#29795)", async ({ page }) => {
    const NATIVE_QUESTION = "native question";
    const LIMIT = 5;
    await createNativeQuestion(
      page,
      {
        name: NATIVE_QUESTION,
        native: { query: `SELECT * FROM "PUBLIC"."ORDERS" LIMIT ${LIMIT}` },
      },
      { loadMetadata: true },
    );

    await openOrdersTable(page, { mode: "notebook", limit: LIMIT });

    await page.locator('icon[name="join_left_outer"]').click();

    await popover(page).within(async () => {
      await page.locator('icon[name="chevronleft"]').click();
      await page.locator(':text("Saved Questions")').click();
      await page.locator(`:text("${NATIVE_QUESTION}")`).click();
    });

    await popover(page).within(async () => {
      await page.locator(':text("ID")').click();
    });

    await popover(page).within(async () => {
      await page.locator(':text("USER_ID")').click();
    });

    await visualize(page, async () => {
      await expect(page.locator(':text(/User ID/i)')).toHaveCount(2);
    });
  });
});

