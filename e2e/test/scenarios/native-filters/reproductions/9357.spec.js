import { restore, openNativeEditor } from "e2e/support/helpers";
import * as SQLFilter from "../helpers/e2e-sql-filter-helpers";


test.describe("issue 9357", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should reorder template tags by drag and drop (metabase#9357)", async ({ page }) => {
    await openNativeEditor(page);
    await SQLFilter.enterParameterizedQuery(
      page,
      "{{firstparameter}} {{nextparameter}} {{lastparameter}}",
    );

    // Drag the firstparameter to last position
    await page.locator("fieldset .Icon-empty")
      .first()
      .dispatchEvent("mousedown", { clientX: 0, clientY: 0, force: true })
      .dispatchEvent("mousemove", { clientX: 5, clientY: 5, force: true })
      .dispatchEvent("mousemove", { clientX: 430, clientY: 0, force: true })
      .dispatchEvent("mouseup", { clientX: 430, clientY: 0, force: true });

    // Ensure they're in the right order
    const variableField = page.locator("text=Variable name").parent();

    await expect(variableField.first()).toHaveText("nextparameter");
    await expect(variableField.last()).toHaveText("firstparameter");
  });
});

