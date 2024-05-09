import {
  restore,
  visitQuestion,
  visitQuestionAdhoc,
} from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

test.describe("scenarios > permissions", () => {
  test.beforeEach(restore);

  const PATHS = ["/dashboard/1", "/question/1", "/collection/1", "/admin"];

  for (const path of PATHS) {
    test(`should display the permissions screen on ${path}`, async ({ page }) => {
      await signIn("none");
      await page.goto(path);
      checkUnauthorized();
    });
  }

  test("should not allow to run adhoc native questions without permissions", async ({ page }) => {
    await signIn("none");

    visitQuestionAdhoc(
      {
        display: "scalar",
        dataset_query: {
          type: "native",
          native: {
            query: "SELECT 1",
          },
          database: SAMPLE_DB_ID,
        },
      },
      { autorun: false },
    );

    await expect(page.locator('[aria-label="Refresh"]')).toBeDisabled();
  });

  test("should display the permissions screen for pulses", async ({ page }) => {
    await signIn("none");
    // There's no pulse in the fixture data, so we stub out the api call to replace the 404 with a 403.
    page.route("api/pulse/1", { statusCode: 403, body: {} });
    await page.goto("/pulse/1");
    checkUnauthorized();
  });

  test("should let a user with no data permissions view questions", async ({ page }) => {
    await signIn("nodata");
    visitQuestion(1);
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await expect(page.locator("text=February 11, 2019, 9:40 PM")).toBeVisible(); // check that the data loads
  });
});

const checkUnauthorized = (page) => {
  expect(page.locator('icon="key"')).toBeVisible();
  expect(page.locator('text="Sorry, you don’t have permission to see that."')).toBeVisible();
};
