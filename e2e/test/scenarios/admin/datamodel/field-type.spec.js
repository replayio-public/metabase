import { restore, visitAlias, popover } from "e2e/support/helpers";
import { SAMPLE_DB_ID, SAMPLE_DB_SCHEMA_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const ordersColumns = ["PRODUCT_ID", "QUANTITY"];

test.describe("scenarios > admin > datamodel > field > field type", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("GET", "/api/table/*/query_metadata*").as("metadata");

    restore();
    cy.signInAsAdmin();

    ordersColumns.forEach(column => {
      cy.wrap(
        `/admin/datamodel/database/${SAMPLE_DB_ID}/schema/${SAMPLE_DB_SCHEMA_ID}/table/${ORDERS_ID}/field/${ORDERS[column]}/general`,
      ).as(`ORDERS_${column}_URL`);
    });

    await page.route("PUT", "/api/field/*").as("fieldUpdate");
  });

  test("should let you change the type to 'No semantic type'", async ({ page }) => {
    visitAlias("@ORDERS_PRODUCT_ID_URL");
    await page.waitForResponse("@metadata");
    await page.waitForResponse("@metadata");

    setFieldType({ oldValue: "Foreign Key", newValue: "No semantic type" });

    waitAndAssertOnResponse("fieldUpdate");

    await page.reload();
    await page.waitForResponse("@metadata");

    getFieldType("No semantic type");
  });

  test("should let you change the type to 'Foreign Key' and choose the target field", async ({ page }) => {
    visitAlias("@ORDERS_QUANTITY_URL");
    await page.waitForResponse("@metadata");

    setFieldType({ oldValue: "Quantity", newValue: "Foreign Key" });

    waitAndAssertOnResponse("fieldUpdate");

    setFKTargetField("Products → ID");

    waitAndAssertOnResponse("fieldUpdate");

    await page.reload();
    await page.waitForResponse("@metadata");
    await page.waitForResponse("@metadata");

    getFieldType("Foreign Key");
    getFKTargetField("Products → ID");
  });

  test("should not let you change the type to 'Number' (metabase#16781)", async ({ page }) => {
    visitAlias("@ORDERS_PRODUCT_ID_URL");
    await page.waitForResponse("@metadata");
    await page.waitForResponse("@metadata");

    checkNoFieldType({ oldValue: "Foreign Key", newValue: "Number" });
  });
});

async function waitAndAssertOnResponse(alias) {
  const response = await page.waitForResponse("@" + alias);
  expect(response.body().errors).toBeUndefined();
}

async function getFieldType(type) {
  return page.locator("text=Field Type")
    .closest("section")
    .locator("[data-testid='select-button-content']")
    .locator(`text=${type}`);
}

async function setFieldType({ oldValue, newValue } = {}) {
  await getFieldType(oldValue).click();

  await popover().within(async () => {
    await page.locator(`text=${oldValue}`).closest(".ReactVirtualized__Grid").scrollTo(0, 0); // HACK: scroll to the top of the list. Ideally we should probably disable AccordionList virtualization
    await searchFieldType(newValue);
    await page.locator(`text=${newValue}`).click();
  });
}

async function checkNoFieldType({ oldValue, newValue } = {}) {
  await getFieldType(oldValue).click();

  await popover().within(async () => {
    await searchFieldType(newValue);
    await page.locator(`text=${newValue}`).should("not.exist");
  });
}

async function searchFieldType(type) {
  await page.locator("input[placeholder='Find...']").type(type);
}

async function getFKTargetField(targetField) {
  return page.locator(".TableEditor-field-target")
    .as("targetField")
    .invoke("text")
    .should("eq", targetField);
}

async function setFKTargetField(field) {
  await page.locator("text=Select a target").click();

  await popover().locator(`text=${field}`).click();
}
