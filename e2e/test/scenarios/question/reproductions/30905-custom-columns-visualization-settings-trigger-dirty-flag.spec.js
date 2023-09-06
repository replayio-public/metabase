import { modal, popover, restore, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS_ID } = SAMPLE_DATABASE;
const EXPRESSION_NAME = "TEST_EXPRESSION";

const question = {
  name: "30905",
  query: {
    "source-table": ORDERS_ID,
    expressions: {
      [EXPRESSION_NAME]: ["+", 1, 1],
    },
  },
};

test.describe("Custom columns visualization settings", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
    const { id } = await createQuestion(question);
    await request("PUT", `/api/card/${id}`, { enable_embedding: true });

    visitQuestion(id);
  });

  test("should not show 'Save' after modifying minibar settings for a custom column", async () => {
    goToExpressionSidebarVisualizationSettings();
    await popover().within(async () => {
      const miniBarSwitch = await page.locator("#show_mini_bar").parent().locator("switch");
      await miniBarSwitch.click();
      await miniBarSwitch.isChecked();
    });
    saveModifiedQuestion();
  });

  test("should not show 'Save' after text formatting visualization settings", async () => {
    goToExpressionSidebarVisualizationSettings();

    await popover().within(async () => {
      const viewAsDropdown = await page.locator("#view_as").parent().locator("[data-testid=select-button]");
      await viewAsDropdown.click();
    });

    await page.locator("[aria-label='Email link']").click();

    await popover().within(async () => {
      await page.locator(":text('Email link')").isVisible();
    });

    saveModifiedQuestion();
  });

  test("should not show 'Save' after saving viz settings from the custom column dropdown", async () => {
    await page.locator(`[data-testid="header-cell"]:text('${EXPRESSION_NAME}')`).click();
    await popover().within(async () => {
      await page.locator("[role='button']:has-text(/gear icon/i)").click();
    });
    await popover().within(async () => {
      const miniBarSwitch = await page.locator("#show_mini_bar").parent().locator("switch");
      await miniBarSwitch.click();
      await miniBarSwitch.isChecked();
    });

    saveModifiedQuestion();
  });
});



async function saveModifiedQuestion() {
  await page.locator("[data-testid='qb-header-action-panel']").within(async () => {
    await page.locator(":text('Save')").click();
  });
  await modal().within(async () => {
    await page.locator(":text(/Replace original question/i)").isVisible();
    await page.locator(":text('Save')").click();
  });

  await page.locator("[data-testid='qb-header-action-panel']").within(async () => {
    await page.locator(":text('Save')").isHidden();
  });
}



async function goToExpressionSidebarVisualizationSettings() {
  await page.locator("[data-testid='viz-settings-button']").click();
  await page.locator(`[data-testid='${EXPRESSION_NAME}-settings-button']`).click();
}

