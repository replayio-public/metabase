import { visualize } from "e2e/support/helpers";

it("should create questions", async ({ page }) => {
  await signInAsAdmin(page);

  await page.goto("/question/new");
  await page.locator('text="Custom question"').click();
  await page.locator('text="Orders"').click();
  await page.locator('icon=join_left_outer').click();
  await page.locator('text="Products"').click();
  await page.locator('text="Product ID"').click();

  await page.locator('text="Add filters to narrow your answer"').click();
  await page.locator('text="Large Purchases"').click();

  await page.locator('text="Pick the metric you want to see"').click();
  await page.locator('text=/^Average of/').click();

  await page.locator('text=/Products?/').click();
  await page.locator('text="Rating"').click();

  await page.locator('text="Pick a column to group by"').click();
  await page.locator('.List-section-title').locator('text="Products"').click();
  await page.locator('text="Category"').click();

  visualize();

  await page.locator('.bar').expect.toHaveCount(4);

  await page.locator('testId=viz-settings-button').click();
  await page.locator('text="Show values on data points"').next().click();
  await page.locator('text="3.71"');

  await page.locator('text="Save"').click();
  await page.locator('ariaLabel="Name"').clear().type("Rating of Best-selling Products");
  await page.locator('ariaLabel="Description"').type(
    "The average rating of our top selling products broken down into categories.",
    { delay: 0 },
  );
  await page.locator('text="Save"').click();
  await page.locator('text="Not now"').click();

  await page.goto("/question/new");
  await page.locator('text="Custom question"').click();
  await page.locator('text=/Sample (Dataset|Database)/').click();
  await page.locator('text="Orders"').click();

  await page.locator('text="Pick the metric you want to see"').click();
  await page.locator('text="Common Metrics"').click();
  await page.locator('text="Revenue"').click();

  await page.locator('text="Pick a column to group by"').click();
  await page.locator('text="Created At"')
    .closest('.List-item')
    .locator('text="by month"')
    .click({ force: true });
  await page.locator('text="Quarter"').click();
  await page.locator('text="Created At: Quarter"');

  visualize();
  await page.locator("circle");

  await page.locator('testId=viz-settings-button').click();
  await page.locator('icon=area').click();
  await page.locator('text="Goal line"').next().click();
  await page.locator('displayValue="0"').type("100000").blur();
  await page.locator(".line");
  await page.locator('text="Goal"');

  await page.locator('text="Save"').click();
  await page.locator('ariaLabel="Name"').clear().type("Quarterly Revenue");
  await page.locator('text="Save"').click();
  await page.locator('text="Not now"').click();
});
