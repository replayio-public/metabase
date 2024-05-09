import {
  restore,
  openOrdersTable,
  openReviewsTable,
  popover,
  summarize,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

test.describe("scenarios > admin > datamodel > metadata", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("should correctly show remapped column value", async ({ page }) => {
    // go directly to Data Model page for Sample Database
    await page.goto(`/admin/datamodel/database/${SAMPLE_DB_ID}`);
    // edit "Product ID" column in "Orders" table
    await page.click('text="Orders"');
    await page.locator('[data-testid="column-PRODUCT_ID"] .Icon-gear').click();

    // remap its original value to use foreign key
    await page.click('text="Use original value"');
    await page.click('text="Use foreign key"');
    await page.click('text="Title"');
    await page.click('text="You might want to update the field name to make sure it still makes sense based on your remapping choices."');

    test.log("Name of the product should be displayed instead of its ID");
    openOrdersTable();
    await page.locator('text="Awesome Concrete Shoes"');
  });

  test("should correctly apply and display custom remapping for numeric values", async ({ page }) => {
    // this test also indirectly reproduces metabase#12771
    const customMap = {
      1: "Awful",
      2: "Unpleasant",
      3: "Meh",
      4: "Enjoyable",
      5: "Perfecto",
    };

    // go directly to Data Model page for Sample Database
    await page.goto(`/admin/datamodel/database/${SAMPLE_DB_ID}`);
    // edit "Rating" values in "Reviews" table
    await page.click('text="Reviews"');
    await page.locator('[data-testid="column-RATING"] .Icon-gear').click();

    // apply custom remapping for "Rating" values 1-5
    await page.click('text="Use original value"');
    await page.click('text="Custom mapping"');
    await page.click('text="You might want to update the field name to make sure it still makes sense based on your remapping choices."');

    for (const [key, value] of Object.entries(customMap)) {
      await page.locator(`input[value="${key}"]`).click().fill(value);
    }
    await page.click('text="Save"');

    test.log("Numeric ratings should be remapped to custom strings");
    openReviewsTable();
    for (const rating of Object.values(customMap)) {
      await page.locator(`text="${rating}"`);
    }
  });

  test("should not include date when metric is binned by hour of day (metabase#14124)", async ({ page }) => {
    await request("PUT", `/api/field/${ORDERS.CREATED_AT}`, {
      semantic_type: null,
    });

    createQuestion(
      {
        name: "14124",
        query: {
          "source-table": ORDERS_ID,
          aggregation: [["count"]],
          breakout: [
            ["field", ORDERS.CREATED_AT, { "temporal-unit": "hour-of-day" }],
          ],
        },
      },
      { visitQuestion: true },
    );

    await page.locator('text="Created At: Hour of day"');

    test.log("Reported failing in v0.37.2");
    await page.locator('text="3:00 AM"');
  });

  test("should not display multiple 'Created At' fields when they are remapped to PK/FK (metabase#15563)", async ({ page }) => {
    // Remap fields
    await request("PUT", `/api/field/${ORDERS.CREATED_AT}`, {
      semantic_type: "type/PK",
    });
    await request("PUT", `/api/field/${REVIEWS.CREATED_AT}`, {
      semantic_type: "type/FK",
      fk_target_field_id: ORDERS.CREATED_AT,
    });

    openReviewsTable({ mode: "notebook" });
    summarize({ mode: "notebook" });
    await page.click('text="Count of rows"');
    await page.click('text="Pick a column to group by"');
    await page.locator('.List-section-header').contains("Created At").click();
    await page.locator('.List-section--expanded .List-item-title')
      .contains("Created At")
      .should("have.length", 1);
  });

  test("display value 'custom mapping' should be available regardless of the chosen filtering type (metabase#16322)", async ({ page }) => {
    await page.goto(
      `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${REVIEWS_ID}/field/${REVIEWS.RATING}/general`,
    );

    openOptionsForSection("Filtering on this field");
    await page.locator('.Popover').findByText("Search box").click();

    openOptionsForSection("Display values");
    await page.locator('.Popover').findByText("Custom mapping").should("not.exist");

    openOptionsForSection("Filtering on this field");
    await page.locator('.Popover').findByText("A list of all values").click();

    openOptionsForSection("Display values");
    await page.locator('.Popover').findByText("Custom mapping");
  });
});

async function openOptionsForSection(sectionName) {
  await page.locator(`text="${sectionName}"`)
    .closest("section")
    .locator('[data-testid="select-button"]')
    .click();
}
