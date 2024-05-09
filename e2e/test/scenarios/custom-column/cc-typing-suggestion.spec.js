import {
  enterCustomColumnDetails,
  openProductsTable,
  restore,
} from "e2e/support/helpers";


test.describe("scenarios > question > custom column > typing suggestion", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    openProductsTable({ mode: "notebook" });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click("text=Custom column");
  });

  test("should not suggest arithmetic operators", async ({ page }) => {
    enterCustomColumnDetails({ formula: "[Price] " });
    await expect(page.locator('@expression-suggestions-list')).not.toBeVisible();
  });

  test("should correctly accept the chosen field suggestion", async ({ page }) => {
    enterCustomColumnDetails({
      formula: "[Rating]{leftarrow}{leftarrow}{leftarrow}",
    });

    // accept the only suggested item, i.e. "[Rating]"
    await page.locator('@formula').press('Enter');

    // if the replacement is correct -> "[Rating]"
    // if the replacement is wrong -> "[Rating] ng"
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=[Rating] ng")).not.toBeVisible();
  });

  test("should correctly accept the chosen function suggestion", async ({ page }) => {
    enterCustomColumnDetails({ formula: "LTRIM([Title])" });

    // Place the cursor between "is" and "empty"
    await page.locator('@formula').press('ArrowLeft', { repeat: 13 });

    // accept the first suggested function, i.e. "length"
    await page.locator('@formula').press('Enter');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=length([Title])")).toBeVisible();
  });

  test("should correctly insert function suggestion with the opening parenthesis", async ({ page }) => {
    enterCustomColumnDetails({ formula: "LOW{enter}" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=lower(")).toBeVisible();
  });

  test("should show expression function helper if a proper function is typed", async ({ page }) => {
    enterCustomColumnDetails({ formula: "lower(" });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=lower(text)")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=Returns the string of text in all lower case.")).toBeVisible();
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=lower([Status])")).toBeVisible();

    await page.locator('@expression-helper-popover-arguments').locator("text=text").hover();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=The column with values to convert to lower case.")).toBeVisible();
  });
});

