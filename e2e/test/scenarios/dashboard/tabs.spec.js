import {
  editDashboard,
  restore,
  visitDashboard,
  saveDashboard,
  openQuestionsSidebar,
  undo,
  dashboardCards,
  sidebar,
  popover,
} from "e2e/support/helpers";


async function createNewTab(page) {
  await page.locator('[aria-label="Create new tab"]').click();
}



test.describe("scenarios > dashboard tabs", () => {
  test.beforeEach(async () => {
    restore();
    await cy.signInAsAdmin();
  });

  test("should only display cards on the selected tab", async ({ page }) => {
    visitDashboard(1);

    editDashboard();
    await createNewTab(page);
    dashboardCards().within(() => {
      cy.findByText("Orders").should("not.exist");
    });

    await page.locator('icon[name="pencil"]').click();
    openQuestionsSidebar();
    sidebar().within(() => {
      cy.findByText("Orders, Count").click();
    });
    saveDashboard();

    await page.locator('[role="tab"][name="Page 1"]').click();
    dashboardCards().within(() => {
      cy.findByText("Orders, count").should("not.exist");
    });
    dashboardCards().within(() => {
      cy.findByText("Orders").should("be.visible");
    });
  });

  test("should allow undoing a tab deletion", async ({ page }) => {
    visitDashboard(1);
    editDashboard();
    await createNewTab(page);

    await page.locator('[role="tab"][name="Page 1"] [role="button"]').click();
    popover().within(() => {
      cy.findByText("Delete").click();
    });
    cy.findByRole("tab", { name: "Page 1" }).should("not.exist");

    undo();
    await page.locator('[role="tab"][name="Page 1"]').click();

    dashboardCards().within(() => {
      cy.findByText("Orders, count").should("not.exist");
    });
    dashboardCards().within(() => {
      cy.findByText("Orders").should("be.visible");
    });
  });
});

