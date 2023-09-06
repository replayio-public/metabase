import {
  createAction,
  restore,
  setActionsEnabledForDB,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const MODEL_ID = 1;

const ACTION_DETAILS = {
  name: "Update orders quantity",
  description: "Set orders quantity to the same value",
  type: "query",
  model_id: MODEL_ID,
  database_id: SAMPLE_DB_ID,
  dataset_query: {
    database: SAMPLE_DB_ID,
    native: {
      query: "UPDATE orders SET quantity = quantity",
    },
    type: "native",
  },
  parameters: [],
  visualization_settings: {
    type: "button",
  },
};


test.describe("issue 29378", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    setActionsEnabledForDB(SAMPLE_DB_ID);
  });

  test("should not crash the model detail page after searching for an action (metabase#29378)", async ({ page }) => {
    await page.request("PUT", `/api/card/${MODEL_ID}`, { dataset: true });
    createAction(ACTION_DETAILS);

    await page.goto(`/model/${MODEL_ID}/detail`);
    await page.locator('text=Actions').click();
    await expect(page.locator(`text=${ACTION_DETAILS.name}`)).toBeVisible();
    await expect(page.locator(`text=${ACTION_DETAILS.dataset_query.native.query}`)).toBeVisible();

    await page.locator('text=Used by').click();
    await page.locator('input[placeholder="Search…"]').fill(ACTION_DETAILS.name);
    await expect(page.locator(`text=${ACTION_DETAILS.name}`)).toBeVisible();

    await page.locator('text=Actions').click();
    await expect(page.locator(`text=${ACTION_DETAILS.name}`)).toBeVisible();
    await expect(page.locator(`text=${ACTION_DETAILS.dataset_query.native.query}`)).toBeVisible();
  });
});

