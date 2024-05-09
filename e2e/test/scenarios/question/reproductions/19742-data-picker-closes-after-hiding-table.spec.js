import { restore, popover, openNavigationSidebar } from "e2e/support/helpers";

test.describe("issue 19742", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  // In order to reproduce the issue, it's important to only use in-app links
  // and don't refresh the app state (like by doing cy.visit)
  test("shouldn't auto-close the data selector after a table was hidden", async ({ page }) => {
    await page.goto("/");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="New"');
    await selectFromDropdown(page, "Question");
    await selectFromDropdown(page, "Sample Database");

    openNavigationSidebar(page);
    await page.click('i[aria-label="gear"]');
    await selectFromDropdown(page, "Admin settings");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Data Model"');
    await hideTable(page, "Orders");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="Exit admin"');

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.click('text="New"');
    await selectFromDropdown(page, "Question");
    await selectFromDropdown(page, "Sample Database");

    await popover(page).locator().within(async () => {
      await expect(page.locator('text="Products"')).toBeVisible();
      await expect(page.locator('text="Reviews"')).toBeVisible();
      await expect(page.locator('text="People"')).toBeVisible();
      await expect(page.locator('text="Orders"')).not.toBeVisible();
    });
  });
});

function selectFromDropdown(optionName) {
  popover().findByText(optionName).click();
}

async function hideTable(page, tableName) {
  await page.locator('text="' + tableName + '"').locator('.Icon-eye_crossed_out').click({ force: true });
}
