import {
  restore,
  filterWidget,
  sidebar,
  editDashboard,
  saveDashboard,
  visitDashboard,
} from "e2e/support/helpers";

const questionDetails = {
  name: "Return input value",
  native: {
    query: "select {{filter}}",
    "template-tags": {
      filter: {
        id: "7182a24e-163a-099c-b085-156f0879aaec",
        name: "filter",
        "display-name": "Filter",
        type: "text",
        required: true,
        default: "Foo",
      },
    },
  },
  display: "scalar",
};

const filter = {
  name: "Text",
  slug: "text",
  id: "904aa8b7",
  type: "string/=",
  sectionId: "string",
  default: "Bar",
};

const dashboardDetails = {
  name: "Required Filters Dashboard",
  parameters: [filter],
};

test.describe("scenarios > dashboard > filters > SQL > simple filter > required ", () => {
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
            target: ["variable", ["template-tag", "filter"]],
          },
        ],
      };

      cy.editDashboardCard(dashboardCard, mapFilterToCard);

      visitDashboard(dashboard_id);
    });
  });

  test('should respect default filter precedence while properly updating the url for each step of the flow', async ({ page }) => {
    // Default dashboard filter
    await expect(page.url()).toContain("?text=Bar");

    await expect(page.locator(".Card")).toHaveText("Bar");

    await expect(page.locator('input[value="Bar"]')).toBeVisible();

    removeWidgetFilterValue();

    await expect(page.url()).toContain("?text=");

    // SQL question defaults
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(":text('Foo')")).toBeVisible();

    // The empty filter widget
    await expect(page.locator('input[placeholder="Text"]')).toBeVisible();

    await page.reload();

    // This part confirms that the issue metabase#13960 has been fixed
    await expect(page.url()).toContain("?text=");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator(":text('Foo')")).toBeVisible();

    // Let's make sure the default dashboard filter is respected upon a subsequent visit from the root
    await page.goto("/collection/root");
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(":text('Required Filters Dashboard')").click();

    await expect(page.url()).toContain("?text=Bar");

    // Finally, when we remove dashboard filter's default value, the url should reflect that by removing the placeholder
    editDashboard();

    openFilterOptions("Text");

    sidebar().within(() => {
      removeDefaultFilterValue("Bar");
    });

    saveDashboard();

    await expect(page.url()).not.toContain("?text=");
  });
});

function removeWidgetFilterValue() {
  filterWidget().find(".Icon-close").click();
}

async function openFilterOptions(filterDisplayName) {
  await page.locator(`:text('${filterDisplayName}')`).parent().locator('.Icon-gear').click();
}

async function removeDefaultFilterValue(value) {
  await page.locator(`input[value="${value}"]`).parent().locator('.Icon-close').click();
}
