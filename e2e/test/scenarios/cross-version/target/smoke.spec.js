import { version } from "./helpers/cross-version-target-helpers";


test.describe(`smoke test the migration to the version ${version}`, () => {
  test("should already be set up", async ({ page }) => {
    await page.route("POST", "/api/card/*/query");

    await page.goto("/");
    await page.locator('text="Sign in to Metabase"');

    await page.locator('input[aria-label="Email address"]').fill("admin@metabase.test");
    await page.locator('input[aria-label="Password"]').fill("12341234");
    await page.locator('button:text("Sign in")').click();

    await page.locator('input[placeholder="Search…"]');

    // Question 1
    await page.goto("/collection/root");
    await page.locator('text="Quarterly Revenue"').click();
    await page.waitForResponse("/api/card/*/query");

    await page.locator('text="It\'s okay to play around with saved questions"');
    await page.locator('button:text("Okay")').click();

    await page.locator("circle");
    await page.locator(".line");
    await page.locator('text="Goal"');
    await expect(page.locator(".x-axis-label")).toHaveText("Created At");
    await expect(page.locator(".y-axis-label")).toHaveText("Revenue");
    await page.locator(".x.axis .tick")
      .should("contain", "Q1 - 2017")
      .and("contain", "Q1 - 2018")
      .and("contain", "Q1 - 2019")
      .and("contain", "Q1 - 2020");

    await page.locator(".y.axis .tick")
      .should("contain", "20,000")
      .and("contain", "100,000")
      .and("contain", "140,000");

    // Question 2
    await page.goto("/collection/root");
    await page.locator('text="Rating of Best-selling Products"').click();
    await page.waitForResponse("/api/card/*/query");

    await page.locator(".bar").should("have.length", 4);
    await page.locator(".x.axis .tick")
      .should("contain", "Gizmo")
      .and("contain", "Gadget")
      .and("contain", "Doohickey")
      .and("contain", "Widget");

    await page.locator(".value-labels")
      .should("contain", "3.27")
      .and("contain", "3.3")
      .and("contain", "3.71")
      .and("contain", "3.4");

    await expect(page.locator(".x-axis-label")).toHaveText("Products → Category");
    await expect(page.locator(".y-axis-label"))
      .toHaveText("Average of Products → Rating");
  });
});
