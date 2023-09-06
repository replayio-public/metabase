import { restore, openNativeEditor } from "e2e/support/helpers";

import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 11580", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("shouldn't reorder template tags when updated (metabase#11580)", async ({ page }) => {
    await openNativeEditor(page);
    await SQLFilter.enterParameterizedQuery(page, "{{foo}} {{bar}}");

    const variableLabels = await page.locator('text="Variable name"').next();

    // ensure they're in the right order to start
    await assertVariablesOrder(variableLabels);

    // change the parameter to a number.
    const variableType = await page.locator('label="Variable type"').first();
    await variableType.click();
    await SQLFilter.chooseType(page, "Number");

    await expect(variableType).toHaveText("Number");

    // ensure they're still in the right order
    await assertVariablesOrder(variableLabels);
  });
});



async function assertVariablesOrder(variableLabels) {
  await expect(variableLabels.first()).toHaveText("foo");
  await expect(variableLabels.last()).toHaveText("bar");
}

