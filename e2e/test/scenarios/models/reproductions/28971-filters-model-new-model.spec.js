import {
  filter,
  filterField,
  filterFieldPopover,
  modal,
  popover,
  restore,
} from "e2e/support/helpers";


test.describe("issue 28971", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsNormalUser(page);
    await page.route("POST", "/api/card", { alias: "createCard" });
    await page.route("POST", "/api/dataset", { alias: "dataset" });
  });

  test("should be able to filter a newly created model (metabase#28971)", async ({ page }) => {
    await page.goto("/");

    await page.locator('text="New"').click();
    await popover().within(() => page.locator('text="Model"').click());
    await page.locator('text="Use the notebook editor"').click();
    await popover().within(() => page.locator('text="Sample Database"').click());
    await popover().within(() => page.locator('text="Orders"').click());
    await page.locator('button="Save"').click();
    await modal().locator('button="Save"').click();
    await page.waitForResponse("@createCard");

    filter();
    filterField("Quantity", { operator: "equal to" });
    await filterFieldPopover("Quantity").within(() => page.locator('text="20"').click());
    await page.locator('button="Apply Filters"').click();
    await page.waitForResponse("@dataset");
    await page.locator('text="Quantity is equal to 20"').isVisible();
    await page.locator('text="Showing 4 rows"').isVisible();
  });
});

