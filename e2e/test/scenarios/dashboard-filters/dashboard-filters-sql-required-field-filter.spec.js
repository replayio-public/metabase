import { restore, filterWidget, visitDashboard } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const questionDetails = {
  name: "SQL products category, required, 2 selections",
  native: {
    query: "select * from PRODUCTS where {{filter}}",
    "template-tags": {
      filter: {
        id: "e33dc805-6b71-99a5-ee14-128383953986",
        name: "filter",
        "display-name": "Filter",
        type: "dimension",
        dimension: ["field", PRODUCTS.CATEGORY, null],
        "widget-type": "category",
        default: ["Gizmo", "Gadget"],
        required: true,
      },
    },
  },
};

const filter = {
  name: "Category",
  slug: "category",
  id: "49fcc65c",
  type: "category",
  default: "Widget",
};

const dashboardDetails = {
  name: "Required Filters Dashboard",
  parameters: [filter],
};


test.describe("scenarios > dashboard > filters > SQL > field filter > required ", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestionAndDashboard({
      questionDetails,
      dashboardDetails,
    }).then(({ body: dashboardCard }) => {
      const { card_id, dashboard_id } = dashboardCard;

      const mapFilterToCard = {
        parameter_mappings: [
          {
            parameter_id: filter.id,
            card_id,
            target: ["dimension", ["template-tag", "filter"]],
          },
        ],
      };

      cy.editDashboardCard(dashboardCard, mapFilterToCard);

      visitDashboard(dashboard_id);
    });
  });

  test("should respect default filter precedence (dashboard filter, then SQL field filters)", async ({ page }) => {
    // Default dashboard filter
    expect(page.url().search).toBe("?category=Widget");

    await expect(page.locator(".Card")).toHaveText("Widget");

    filterWidget().contains("Widget");

    removeWidgetFilterValue();

    expect(page.url().search).toBe("?category=");

    // SQL question defaults
    await page.locator("@dashboardCard").within(() => {
      page.locator('*').toHaveText("Gizmo");
      page.locator('*').toHaveText("Gadget");
    });

    // The empty filter widget
    filterWidget().contains("Category");

    await page.reload();

    // This part confirms that the issue metabase#13960 has been fixed
    expect(page.url().search).toBe("?category=");

    await page.locator("@dashboardCard").within(() => {
      page.locator('*').toHaveText("Gizmo");
      page.locator('*').toHaveText("Gadget");
    });

    // Let's make sure the default dashboard filter is respected upon a subsequent visit from the root
    await page.goto("/collection/root");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator('*').toHaveText("Required Filters Dashboard").click();

    expect(page.url().search).toBe("?category=Widget");
  });
});


function removeWidgetFilterValue() {
  filterWidget().find(".Icon-close").click();
}
