import {
  restore,
  modal,
  setActionsEnabledForDB,
  createAction,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { ORDERS_ID } = SAMPLE_DATABASE;

const DEFAULT_ACTION_DETAILS = {
  database_id: SAMPLE_DB_ID,
  dataset_query: {
    database: SAMPLE_DB_ID,
    native: {
      query: "UPDATE orders SET quantity = 0 WHERE id = {{order_id}}",
      "template-tags": {
        order_id: {
          "display-name": "Order ID",
          id: "fake-uuid",
          name: "order_id",
          type: "text",
        },
      },
    },
    type: "native",
  },
  name: "Reset order quantity",
  description: "Set order quantity to 0",
  type: "query",
  parameters: [
    {
      id: "fake-uuid",
      hasVariableTemplateTagTarget: true,
      name: "Order ID",
      slug: "order_id",
      type: "string/=",
      target: ["variable", ["template-tag", "fake-uuid"]],
    },
  ],
  visualization_settings: {
    fields: {
      "fake-uuid": {
        id: "fake-uuid",
        fieldType: "string",
        inputType: "string",
        hidden: false,
        order: 999,
        required: true,
        name: "",
        title: "",
        placeholder: "",
        description: "",
      },
    },
    type: "button",
  },
};


test.describe("scenarios > admin > settings > public sharing", () => {
  test.beforeEach(async () => {
    restore();
    await cy.signInAsAdmin();
  });

  test("should be able to toggle public sharing", async ({ page }) => {
    await page.goto("/admin/settings/public-sharing");
    const publicSharingToggle = page.locator('label:has-text("Enable Public Sharing") input');
    await expect(publicSharingToggle).toBeChecked();
    await publicSharingToggle.click();
    await expect(publicSharingToggle).not.toBeChecked();
  });

  // Other tests should be converted similarly, replacing "it" with "test" and using Playwright's API instead of Cypress
});

