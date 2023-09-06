import {
  restore,
  visitDashboard,
  editDashboard,
  saveDashboard,
} from "e2e/support/helpers";

const Q1 = {
  name: "21665 Q1",
  native: { query: "select 1" },
  display: "scalar",
};

const Q2 = {
  name: "21665 Q2",
  native: { query: "select 2" },
  display: "scalar",
};


test.describe("issue 21665", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestionAndDashboard({
      questionDetails: Q1,
      dashboardDetails: { name: "21665D" },
    }).then(({ body: { id } }) => {
      cy.intercept(
        "GET",
        `/api/dashboard/${id}`,
        cy.spy().as("dashboardLoaded"),
      ).as("getDashboard");

      cy.wrap(id).as("dashboardId");

      cy.createNativeQuestion(Q2);

      visitDashboard(id);
      editDashboard();
    });

    await page.locator('[data-testid="add-series-button"]').click({ force: true });

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${Q2.name}`).click();

    await page.locator('.AddSeriesModal').within(() => {
      page.locator('button').withText('Done').click();
    });

    saveDashboard();
    cy.wait("@getDashboard");
  });

  test("multi-series cards shouldnt cause frontend to reload (metabase#21665)", async ({ page }) => {
    editQ2NativeQuery("select order by --");

    cy.get("@dashboardId").then(id => {
      visitDashboard(id);
    });

    cy.get("@dashboardLoaded").should("have.been.calledThrice");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('text="There was a problem displaying this chart."').isVisible();
  });
});



async function editQ2NativeQuery(query) {
  await cy.request("PUT", "/api/card/5", {
    dataset_query: {
      type: "native",
      native: { query },
      database: 1,
    },
  });
}

