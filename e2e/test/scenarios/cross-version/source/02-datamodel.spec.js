import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, REVIEWS, PRODUCTS, PEOPLE } = SAMPLE_DATABASE;

const sampleDBDataModelPage = `/admin/datamodel/database/${SAMPLE_DB_ID}`;

it("should configure data model settings", async ({ page }) => {
  await signInAsAdmin(page);

  await page.goto("/admin/datamodel");
  await expect(page).toHaveURL(sampleDBDataModelPage);

  // Remap ORDERS.PRODUCT_ID display value to PRODUCTS.TITLE
  await page.route("POST", `/api/field/${ORDERS.PRODUCT_ID}/dimension`);

  await page.locator(".AdminList").findByText("Orders").click();
  await page.locator('.FormField [displayvalue="Product ID"]').parent().locator(".Icon-gear").click();
  await page.locator(':text("Use original value")').click();
  await page.locator(':text("Use foreign key")').click();
  await page.locator(':text("Title")').click();
  await page.waitForResponse(`/api/field/${ORDERS.PRODUCT_ID}/dimension`);

  await page.goto(sampleDBDataModelPage);
  await page.locator(".AdminList").findByText("Reviews").click();
  await page.route("POST", `/api/field/${REVIEWS.RATING}/values`);

  await page.locator('.FormField [displayvalue="Rating"]').parent().locator(".Icon-gear").click();
  await page.locator(':text("Use original value")').click();
  await page.locator(':text("Custom mapping")').click();
  await page.waitForResponse(`/api/field/${REVIEWS.RATING}/values`);
  await page.locator(':text("You might want to update the field name to make sure it still makes sense based on your remapping choices.")');

  const customMap = {
    1: "Awful",
    2: "Unpleasant",
    3: "Meh",
    4: "Enjoyable",
    5: "Perfecto",
  };

  for (const [key, value] of Object.entries(customMap)) {
    await page.locator(`.FormField [displayvalue="${key}"]`).click().fill(value);
  }

  await page.locator('.Button:has-text("Save")').click();
  await page.waitForResponse(`/api/field/${REVIEWS.RATING}/values`);

  // Hide PRODUCTS.EAN
  await page.goto(sampleDBDataModelPage);
  await page.locator(".AdminList").findByText("Products").click();

  await page.route("PUT", `/api/field/${PRODUCTS.EAN}`);
  await page.locator('.FormField [displayvalue="Ean"]').parent().locator(':text("Everywhere")').click();
  await page.locator(':text("Do not include")').click();
  await page.waitForResponse(`/api/field/${PRODUCTS.EAN}`);

  await page.route("PUT", `/api/field/${PRODUCTS.PRICE}`);
  await page.locator('.FormField [displayvalue="Price"]').parent().locator(':text("No semantic type")').click();
  await page.locator('.MB-Select').scrollTo("top").within(async () => {
    await page.locator(':placeholder("Find...")').type("Pr");
    await page.locator(':text("Price")').click();
  });
  await page.waitForResponse(`/api/field/${PRODUCTS.PRICE}`);
  await page.locator(':text("US Dollar")').click();
  await page.locator(':text("Euro")').click();
  await page.waitForResponse(`/api/field/${PRODUCTS.PRICE}`);

  // Hide PEOPLE.PASSWORD
  await page.locator(".AdminList").findByText("People").click();

  await page.route("PUT", `/api/field/${PEOPLE.PASSWORD}`);
  await page.locator('.FormField [displayvalue="Password"]').parent().locator(':text("Everywhere")').click();
  await page.locator(':text("Do not include")').click();
  await page.waitForResponse(`/api/field/${PEOPLE.PASSWORD}`);

  const metric = {
    name: "Revenue",
    description: "Sum of orders subtotal",
    table_id: ORDERS_ID,
    definition: {
      "source-table": ORDERS_ID,
      aggregation: [["sum", ["field", ORDERS.SUBTOTAL, null]]],
    },
  };

  const segment = {
    name: "Large Purchases",
    description: "Orders over $100.",
    table_id: ORDERS_ID,
    definition: {
      "source-table": ORDERS_ID,
      filter: [">", ["field", ORDERS.TOTAL, null], 100],
    },
  };

  await page.request("POST", "/api/metric", metric);
  await page.request("POST", "/api/segment", segment);

  await page.goto("/admin/datamodel/segments");
  await page.locator(':text(segment.name)');

  await page.goto("/admin/datamodel/metrics");
  await page.locator(':text(metric.name)');
});
