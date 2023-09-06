import {
  restore,
  popover,
  openTable,
  visitQuestionAdhoc,
  getBinningButtonForDimension,
  summarize,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID, ORDERS, PEOPLE_ID, PEOPLE, PRODUCTS_ID, PRODUCTS } =
  SAMPLE_DATABASE;

const ordersJoinPeopleQuery = {
  type: "query",
  query: {
    "source-table": ORDERS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PEOPLE_ID,
        condition: [
          "=",
          ["field", ORDERS.USER_ID, null],
          ["field", PEOPLE.ID, { "join-alias": "People" }],
        ],
        alias: "People",
      },
    ],
    fields: [["field", ORDERS.ID, null]],
  },
  database: SAMPLE_DB_ID,
};

const ordersJoinProductsQuery = {
  type: "query",
  query: {
    "source-table": ORDERS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field", ORDERS.PRODUCT_ID, null],
          ["field", PRODUCTS.ID, { "join-alias": "Products" }],
        ],
        alias: "Products",
      },
    ],
    fields: [["field", ORDERS.ID, null]],
  },
  database: SAMPLE_DB_ID,
};

const NUMBER_BUCKETS = [
  "Auto bin",
  "10 bins",
  "50 bins",
  "100 bins",
  "Don't bin",
];

const TIME_BUCKETS = [
  "Minute",
  "Hour",
  "Day",
  "Week",
  "Month",
  "Quarter",
  "Year",
  "Minute of hour",
  "Hour of day",
  "Day of week",
  "Day of month",
  "Day of year",
  "Week of year",
  "Month of year",
  "Quarter of year",
];

const LONGITUDE_BUCKETS = [
  "Auto bin",
  "Bin every 0.1 degrees",
  "Bin every 1 degree",
  "Bin every 10 degrees",
  "Bin every 20 degrees",
  "Don't bin",
];

/**
 * Makes sure that all binning options (bucket sizes) are rendered correctly for the regular table.
 *  1. no option should be rendered multiple times
 *  2. the selected option should be highlighted when the popover with all options opens
 *
 * This spec covers the following issues:
 *  - metabase#15574
 */

test.describe("scenarios > binning > binning options", () => {
  test.beforeEach(async ({ page }) => {
    await interceptDataset(page);
    await restore(page);
    await signInAsAdmin(page);
  });

  test.describe("via simple question", () => {
    test('should render number binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({ page, table: ORDERS_ID, column: "Total" });
      await getTitle(page, "Count by Total: Auto binned");

      await openBinningListForDimension(page, "Total", "Auto binned");
      await getAllOptions({ page, options: NUMBER_BUCKETS, isSelected: "Auto bin" });
    });

    test('should render time series binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({ page, table: ORDERS_ID, column: "Created At" });
      await getTitle(page, "Count by Created At: Month");

      await openBinningListForDimension(page, "Created At", "by month");
      await getAllOptions({ page, options: TIME_BUCKETS, isSelected: "Month" });
    });

    test('should render longitude/latitude binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({ page, table: PEOPLE_ID, column: "Longitude" });
      await getTitle(page, "Count by Longitude: Auto binned");

      await openBinningListForDimension(page, "Longitude", "Auto binned");
      await getAllOptions({ page, options: LONGITUDE_BUCKETS, isSelected: "Auto bin" });
    });
  });

  test.describe("via custom question", () => {
    test('should render number binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({
        page,
        table: ORDERS_ID,
        mode: "notebook",
        column: "Total",
      });

      await getTitle(page, "Count by Total: Auto binned");

      await page.locator('text=Total: Auto binned').click();
      await openBinningListForDimension(page, "Total", "Auto binned");

      await getAllOptions({ page, options: NUMBER_BUCKETS, isSelected: "Auto bin" });
    });

    test('should render time series binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({
        page,
        table: ORDERS_ID,
        mode: "notebook",
        column: "Created At",
      });

      await getTitle(page, "Count by Created At: Month");

      await page.locator('text=Created At: Month').click();
      await openBinningListForDimension(page, "Created At", "by month");

      await getAllOptions({ page, options: TIME_BUCKETS, isSelected: "Month" });
    });

    test('should render longitude/latitude binning options correctly', async ({ page }) => {
      await chooseInitialBinningOption({
        page,
        table: PEOPLE_ID,
        mode: "notebook",
        column: "Longitude",
      });

      await getTitle(page, "Count by Longitude: Auto binned");

      await page.locator('text=Longitude: Auto binned').click();
      await openBinningListForDimension(page, "Longitude", "Auto binned");

      await getAllOptions({ page, options: LONGITUDE_BUCKETS, isSelected: "Auto bin" });
    });
  });

  test.describe("via time series footer (metabase#11183)", () => {
    test('should render time series binning options correctly', async ({ page }) => {
      await openTable({ page, table: ORDERS_ID });

      await page.locator('text=Created At').click();
      await page.locator('text=Distribution').click();

      await getTitle(page, "Count by Created At: Month");

      await page.locator('testId=select-button-content >> text=Month').click();
      await getAllOptions({ page, options: TIME_BUCKETS, isSelected: "Month" });
    });
  });

  // Skipping the "implicit joins" and "explicit joins" contexts as they are marked as skipped in the original code
});

async function chooseInitialBinningOption({ page, table, column, mode = null } = {}) {
  await openTable({ page, table, mode });
  await summarize({ page, mode });

  if (mode === "notebook") {
    await page.locator('text=Count of rows').click();
    await page.locator('text=Pick a column to group by').click();
    await page.locator(`text=${column}`).click();
  } else {
    await page.locator(`testId=sidebar-right >> text=${column}`).first().click();
  }
}

async function chooseInitialBinningOptionForExplicitJoin({
  page,
  baseTableQuery,
  column,
} = {}) {
  await visitQuestionAdhoc({ page, dataset_query: baseTableQuery });

  await summarize({ page });

  await page.locator('testId=sidebar-right').within(() => {
    page.locator('text=Count'); // Test fails without this because of some weird race condition
    page.locator(`text=${column}`).click();
  });
}

function openBinningListForDimension(column, binning) {
  getBinningButtonForDimension({ name: column, isSelected: true })
    .should("contain", binning)
    .click();
}

async function getTitle(page, title) {
  await page.locator(`text=${title}`);
}

async function getAllOptions({ page, options, isSelected } = {}) {
  const selectedOption = options.find(option => option === isSelected);
  const regularOptions = options.filter(option => option !== isSelected);

  // Custom question has two popovers open.
  // The binning options are in the latest (last) one.
  // Using `.last()` works even when only one popover is open so it covers both scenarios.
  await page.locator('testId=popover-container').last().within(() => {
    regularOptions.forEach(option => {
      // Implicit assertion - will fail if string is rendered multiple times
      page.locator(`text=${option}`);
    });

    isSelected &&
      page
        .locator(`text=${selectedOption}`)
        .closest("li")
        .should("have.attr", "aria-selected", "true");
  });
}
