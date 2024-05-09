import {
  restore,
  showDashboardCardActions,
  popover,
  visitDashboard,
  addTextBox,
} from "e2e/support/helpers";

test.describe("scenarios > dashboard > text-box", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();
  });

  test.describe("Editing", () => {
    test.beforeEach(async ({ page }) => {
      // Create text box card
      visitDashboard(1);
      addTextBox("Text *text* __text__");
    });

    test('should render correct icons for preview and edit modes', async ({ page }) => {
      showDashboardCardActions(1);

      // edit mode
      await page.locator('icon[name="eye"]').click();

      // preview mode
      await page.locator('icon[name="edit_document"]');
    });

    test('should render visualization options (metabase#22061)', async ({ page }) => {
      showDashboardCardActions(1);

      // edit mode
      await page.locator('icon[name="palette"]').nth(1).click();

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Vertical Alignment")');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Horizontal Alignment")');
    });

    test('should not render edit and preview actions when not editing', async ({ page }) => {
      // Exit edit mode and check for edit options
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Save")').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("You are editing a dashboard")').should("not.exist");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Text text text")');
      await page.locator('icon[name="edit_document"]').should("not.exist");
      await page.locator('icon[name="eye"]').should("not.exist");
    });

    test('should switch between rendered markdown and textarea input', async ({ page }) => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Text *text* __text__")');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Save")').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Text text text")');
    });
  });

  test.describe("when text-box is the only element on the dashboard", () => {
    test.beforeEach(async ({ page }) => {
      cy.createDashboard().then(({ body: { id } }) => {
        cy.intercept("PUT", `/api/dashboard/${id}`).as("dashboardUpdated");

        visitDashboard(id);
      });
    });

    // fixed in metabase#11358
    test('should load after save/refresh (metabase#12873)', async ({ page }) => {
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Test Dashboard")');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("This dashboard is looking empty.")');

      // Add save text box to dash
      addTextBox("Dashboard testing text");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Save")').click();

      // Reload page
      await page.reload();

      // Page should still load
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("New")');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Loading...")').should("not.exist");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Cannot read property 'type' of undefined")').should(
        "not.exist",
      );
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Test Dashboard")');

      // Text box should still load
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Dashboard testing text")');
    });

    test('should have a scroll bar for long text (metabase#8333)', async ({ page }) => {
      addTextBox(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ut fermentum erat, nec sagittis justo. Vivamus vitae ipsum semper, consectetur odio at, rutrum nisi. Fusce maximus consequat porta. Mauris libero mi, viverra ac hendrerit quis, rhoncus quis ante. Pellentesque molestie ut felis non congue. Vivamus finibus ligula id fringilla rutrum. Donec quis dignissim ligula, vitae tempor urna.\n\nDonec quis enim porta, porta lacus vel, maximus lacus. Sed iaculis leo tortor, vel tempor velit tempus vitae. Nulla facilisi. Vivamus quis sagittis magna. Aenean eu eros augue. Sed euismod pulvinar laoreet. Morbi commodo, sem sed dictum faucibus, sem ante ultrices libero, nec ornare risus lacus eget velit. Etiam sagittis lectus non erat tristique tempor. Sed in ipsum urna. Sed venenatis turpis at orci feugiat, ut gravida lectus luctus.",
      );
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Save")').click();

      cy.wait("@dashboardUpdated");

      // The test fails if there is no scroll bar
      await page.locator('.text-card-markdown')
        .should("have.css", "overflow-x", "hidden")
        .should("have.css", "overflow-y", "auto")
        .scrollTo("bottom");
    });

    test('should render html links, and not just the markdown flavor of them (metabase#18114)', async ({ page }) => {
      addTextBox(
        "- Visit https://www.metabase.com{enter}- Or go to [Metabase](https://www.metabase.com)",
      );

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("Save")').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(':text("You're editing this dashboard.")').should("not.exist");

      await page.locator('.Card')
        .findAllByRole("link")
        .should("be.visible")
        .and("have.length", 2);
    });
  });

  test('should let you add a parameter to a dashboard with a text box (metabase#11927)', async ({ page }) => {
    visitDashboard(1);
    // click pencil icon to edit
    await page.locator('icon[name="pencil"]').click();
    // add text box with text
    await page.locator('icon[name="string"]').click();
    await page.locator('.DashCard').last().locator('textarea').type("text text text");
    await page.locator('icon[name="filter"]').click();
    popover().within(() => {
      await page.locator(':text("Text or Category")').click();
      await page.locator(':text("Is")').click();
    });
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Save")').click();

    // confirm text box and filter are still there
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("text text text")');
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Text")');
  });
});
