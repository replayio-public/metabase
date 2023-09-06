import {
  restore,
  openOrdersTable,
  visualize,
  popover,
  summarize,
} from "e2e/support/helpers";

test.describe("issue 18589", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await page.route("POST", "/api/dataset");
  });

  test("should not bin numeric fields in join condition by default (metabase#18589)", async ({ page }) => {
    await openOrdersTable({ mode: "notebook", page });

    await joinTable("Reviews", page);
    await selectFromDropdown("Quantity", page);
    await selectFromDropdown("Rating", page);

    await summarize({ mode: "notebook", page });
    await selectFromDropdown("Count of rows", page);

    await visualize(page);

    await expect(page.locator('text="2,860,368"')).toBeVisible();
  });
});

async function joinTable(table, page) {
  await page.locator('text="Join data"').click();
  await page.locator(`text="${table}"`).click();
}

function selectFromDropdown(option, clickOpts) {
  popover().findByText(option).click(clickOpts);
}
