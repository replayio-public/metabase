import { restore, typeAndBlurUsingLabel, isEE } from "e2e/support/helpers";


test.describe("scenarios > admin > databases > exceptions", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();
  });

  test("should handle malformed (null) database details (metabase#25715)", async ({ page, context }) => {
    context.intercept("GET", "/api/database/1", req => {
      req.reply(res => {
        res.body.details = null;
      });
    }).as("loadDatabase");

    await page.goto("/admin/databases/1");
    await context.waitFor("@loadDatabase");

    await expect(page.locator("nav")).toContainText("Metabase Admin");
    await expect(page.locator("body")).toContainText(/Sample Database/i);
    await expect(page.locator('button:has-text("Remove this database")')).not.toBeDisabled();
  });

  test("should show error upon a bad request", async ({ page, context }) => {
    context.intercept("POST", "/api/database", req => {
      req.reply({
        statusCode: 400,
        body: "DATABASE CONNECTION ERROR",
      });
    }).as("createDatabase");

    await page.goto("/admin/databases/create");

    await typeAndBlurUsingLabel("Display name", "Test");
    await typeAndBlurUsingLabel("Database name", "db");
    await typeAndBlurUsingLabel("Username", "admin");

    await page.locator('button:has-text("Save")').click();
    await context.waitFor("@createDatabase");

    await expect(page.locator("body")).toContainText("DATABASE CONNECTION ERROR");
  });

  test("should handle non-existing databases (metabase#11037)", async ({ page, context }) => {
    context.intercept("GET", "/api/database/999").as("loadDatabase");
    await page.goto("/admin/databases/999");
    await context.waitFor("@loadDatabase").then(({ response }) => {
      expect(response.statusCode).to.eq(404);
    });
    await expect(page.locator("body")).toContainText("Not found.");
    await expect(page.locator("table")).not.toBeVisible();
  });

  test("should handle a failure to `GET` the list of all databases (metabase#20471)", async ({ page, context }) => {
    const errorMessage = "Lorem ipsum dolor sit amet, consectetur adip";

    context.intercept(
      {
        method: "GET",
        pathname: "/api/database",
        query: isEE
          ? {
              exclude_uneditable_details: "true",
            }
          : null,
      },
      req => {
        req.reply({
          statusCode: 500,
          body: { message: errorMessage },
        });
      },
    ).as("failedGet");

    await page.goto("/admin/databases");
    await context.waitFor("@failedGet");

    await expect(page.locator("h1")).toContainText("Something's gone wrong");
    await expect(page.locator("body")).toContainText("We've run into an error. You can try refreshing the page, or just go back.");

    await expect(page.locator("body")).not.toContainText(errorMessage);
    await page.locator('button:has-text("Show error details")').click();
    await expect(page.locator("body")).toContainText(errorMessage);
  });
});
