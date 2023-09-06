import {
  restore,
  openTable,
  visualize,
  changeBinningForDimension,
  summarize,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, PEOPLE_ID } = SAMPLE_DATABASE;

test.describe("scenarios > binning > binning options", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test.describe("via simple question", () => {
    test('should work for number', async ({ page }) => {
      chooseInitialBinningOption({
        table: ORDERS_ID,
        column: "Total",
        defaultBucket: "Auto bin",
        bucketSize: "50 bins",
      });

      getTitle("Count by Total: 50 bins");

      await page.locator(".bar");
      await page.locator("text=70");
    });

    test('should work for time series', async ({ page }) => {
      chooseInitialBinningOption({
        table: ORDERS_ID,
        column: "Created At",
        defaultBucket: "by month",
        bucketSize: "Quarter",
      });

      getTitle("Count by Created At: Quarter");

      await page.locator("circle");
      await page.locator("text=Q1 - 2017");
    });

    test('should work for longitude/latitude', async ({ page }) => {
      chooseInitialBinningOption({
        table: PEOPLE_ID,
        column: "Longitude",
        defaultBucket: "Auto bin",
        bucketSize: "Bin every 20 degrees",
      });

      getTitle("Count by Longitude: 20°");

      await page.locator(".bar");
      await page.locator("text=180° W");
    });
  });

  test.describe("via custom question", () => {
    test('should work for number', async ({ page }) => {
      chooseInitialBinningOption({
        table: ORDERS_ID,
        column: "Total",
        defaultBucket: "Auto bin",
        bucketSize: "50 bins",
        mode: "notebook",
      });

      getTitle("Count by Total: 50 bins");

      await page.locator(".bar");
      await page.locator("text=70");
    });

    test('should work for time series', async ({ page }) => {
      chooseInitialBinningOption({
        table: ORDERS_ID,
        column: "Created At",
        defaultBucket: "by month",
        bucketSize: "Quarter",
        mode: "notebook",
      });

      getTitle("Count by Created At: Quarter");

      await page.locator("circle");
      await page.locator("text=Q1 - 2017");
    });

    test('should work for longitude/latitude', async ({ page }) => {
      chooseInitialBinningOption({
        table: PEOPLE_ID,
        column: "Longitude",
        defaultBucket: "Auto bin",
        bucketSize: "Bin every 20 degrees",
        mode: "notebook",
      });

      getTitle("Count by Longitude: 20°");

      await page.locator(".bar");
      await page.locator("text=180° W");
    });
  });

  test.describe("via column popover", () => {
    test('should work for number', async ({ page }) => {
      openTable({ table: ORDERS_ID });
      await page.locator("text=Total").click();
      await page.locator("text=Distribution").click();

      getTitle("Count by Total: Auto binned");

      await page.locator(".bar");
      await page.locator("text=60");
    });

    test('should work for time series', async ({ page }) => {
      openTable({ table: ORDERS_ID });
      await page.locator("text=Created At").click();
      await page.locator("text=Distribution").click();

      getTitle("Count by Created At: Month");

      await page.locator("circle");
      await page.locator("text=January, 2017");
    });

    test('should work for longitude/latitude', async ({ page }) => {
      openTable({ table: PEOPLE_ID });
      await page.locator("text=Longitude").click();
      await page.locator("text=Distribution").click();

      getTitle("Count by Longitude: Auto binned");

      await page.locator(".bar");
      await page.locator("text=170° W");
    });
  });
});

async function chooseInitialBinningOption({
  table,
  column,
  defaultBucket,
  bucketSize,
  mode = null,
} = {}) {
  openTable({ table, mode });
  summarize({ mode });

  if (mode === "notebook") {
    await page.locator("text=Count of rows").click();
    await page.locator("text=Pick a column to group by").click();

    changeBinningForDimension({
      name: column,
      fromBinning: defaultBucket,
      toBinning: bucketSize,
    });

    visualize();
  } else {
    changeBinningForDimension({
      name: column,
      fromBinning: defaultBucket,
      toBinning: bucketSize,
    });
  }
}

async function getTitle(title) {
  await page.locator(`text=${title}`);
}
