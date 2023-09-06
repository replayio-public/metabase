import {
  restore,
  appBar,
  popover,
  openNavigationSidebar,
  leftSidebar,
  visitQuestion,
  POPOVER_ELEMENT,
} from "e2e/support/helpers";

test.describe("11914, 18978, 18977", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test('should not display query editing controls and "Browse Data" link', async ({ page }) => {
    const questionId = await createQuestion({
      query: {
        "source-table": "card__1",
      },
    });

    await signIn("nodata", page);
    await visitQuestion(questionId, page);
    await openNavigationSidebar(page);

    await expect(page.locator('text=/Browse data/i')).not.toBeVisible();
    await page.locator('icon=add').click();

    await popover(page).locator('text=Question').not.toBeVisible();
    await popover(page).locator('text=/SQL query/').not.toBeVisible();
    await popover(page).locator('text=/Native query/').not.toBeVisible();

    // Click outside to close the "new" button popover
    await appBar(page).click();

    await page.locator('[data-testid="qb-header-action-panel"]').locator('icon=notebook').not.toBeVisible();
    await page.locator('[data-testid="qb-header-action-panel"]').locator('text=Filter').not.toBeVisible();
    await page.locator('[data-testid="qb-header-action-panel"]').locator('text=Summarize').not.toBeVisible();
    await page.locator('[data-testid="qb-header-action-panel"]').locator('icon=refresh').toBeVisible();

    // Ensure no drills offered when clicking a column header
    await page.locator('text=Subtotal').click();
    assertNoOpenPopover(page);

    // Ensure no drills offered when clicking a regular cell
    await page.locator('text=6.42').click();
    assertNoOpenPopover(page);

    // Ensure no drills offered when clicking FK
    await page.locator('text=184').click();
    assertNoOpenPopover(page);

    assertIsNotAdHoc(questionId, page);

    await setVisualizationTo("line", page);
    assertIsNotAdHoc(questionId, page);

    // Rerunning a query with changed viz settings will make it use the `/dataset` endpoint,
    // so a user will see the "Your don't have permission" error
    // Need to ensure "refresh" button is hidden now
    assertNoRefreshButton(page);

    await addGoalLine(page);
    assertIsNotAdHoc(questionId, page);
    assertNoRefreshButton(page);
  });
});

async function setVisualizationTo(vizName, page) {
  await page.locator('[data-testid="viz-type-button"]').click();

  await leftSidebar(page).locator(`icon=${vizName}`).click();
  await leftSidebar(page).locator(`icon=${vizName}`).hover();
  await leftSidebar(page).locator('icon=gear').click();
  await leftSidebar(page).locator('text=X-axis').parent().locator('text=Select a field').click();
  await selectFromDropdown("Created At", page);

  await leftSidebar(page).locator('text=Y-axis').parent().locator('text=Select a field').click();
  await selectFromDropdown("Quantity", page);

  await leftSidebar(page).locator('text=Done').click();
}

async function addGoalLine(page) {
  await page.locator('[data-testid="viz-settings-button"]').click();
  await leftSidebar(page).locator('text=Display').click();
  await leftSidebar(page).locator('text=Goal line').parent().locator('input').click();
  await leftSidebar(page).locator('text=Done').click();
  await page.locator('.Visualization').locator('.goal').toBeVisible();
}

function assertIsNotAdHoc(questionId, page) {
  await page.url().should("include", `/question/${questionId}`);
  await page.locator('[data-testid="qb-header"]').locator('text=Save').not.toBeVisible();
}

function assertNoRefreshButton(page) {
  await page.locator('[data-testid="qb-header-action-panel"]').locator('icon=refresh').not.toBeVisible();
}

function assertNoOpenPopover(page) {
  await page.locator(POPOVER_ELEMENT).not.toBeVisible();
}

function selectFromDropdown(option) {
  popover().findByText(option).click();
}
