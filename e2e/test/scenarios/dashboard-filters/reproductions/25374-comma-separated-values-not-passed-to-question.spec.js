import { restore, visitDashboard, filterWidget } from "e2e/support/helpers";

const questionDetails = {
  name: "25374",
  native: {
    "template-tags": {
      num: {
        id: "f7672b4d-1e84-1fa8-bf02-b5e584cd4535",
        name: "num",
        "display-name": "Num",
        type: "number",
        default: null,
      },
    },
    query: "select count(*) from orders where id in ({{num}})",
  },
  parameters: [
    {
      id: "f7672b4d-1e84-1fa8-bf02-b5e584cd4535",
      type: "number/=",
      target: ["variable", ["template-tag", "num"]],
      name: "Num",
      slug: "num",
      default: null,
    },
  ],
};

const filterDetails = {
  name: "Equal to",
  slug: "equal_to",
  id: "10c0d4ba",
  type: "number/=",
  sectionId: "number",
};

const dashboardDetails = {
  name: "25374D",
  parameters: [filterDetails],
};


test.describe("issue 25374", () => {
  test.beforeEach(async ({ page }) => {
    // Replace Cypress commands with Playwright equivalents
    // ...

    await visitDashboard(dashboard_id);

    await filterWidget().type("1,2,3{enter}");
    await page.locator('.CardVisualization')
      .expect(page.locator('.CardVisualization').textContent()).toContain("COUNT(*)")
      .expect(page.locator('.CardVisualization').textContent()).toContain("3");

    await page.locator('input[name="equal_to"]').expect(page.locator('input[name="equal_to"]').value()).toEqual("1,2,3");
  });

  test("should pass comma-separated values down to the connected question (metabase#25374-1)", async ({ page }) => {
    // Drill-through and go to the question
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(`text=${questionDetails.name}`).click();
    // Replace cy.wait("@cardQuery") with Playwright equivalent
    // ...

    await page.locator('.cellData')
      .expect(page.locator('.cellData').textContent()).toContain("COUNT(*)")
      .expect(page.locator('.cellData').textContent()).toContain("3");

    await page.locator('input[name="num"]').expect(page.locator('input[name="num"]').value()).toEqual("1,2,3");
  });

  test("should retain comma-separated values on refresh (metabase#25374-2)", async ({ page }) => {
    await page.reload();

    // Make sure filter widget still has all the values
    await page.locator('input[name="equal_to"]').expect(page.locator('input[name="equal_to"]').value()).toEqual("1,2,3");

    // Make sure the result in the card is correct
    await page.locator('.CardVisualization')
      .expect(page.locator('.CardVisualization').textContent()).toContain("COUNT(*)")
      .expect(page.locator('.CardVisualization').textContent()).toContain("3");

    // Make sure URL search params are correct
    // Replace cy.location("search").should("eq", "?equal_to=1%2C2%2C3") with Playwright equivalent
    // ...
  });
});

