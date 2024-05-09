import {
  restore,
  filterWidget,
  addOrUpdateDashboardCard,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE, PEOPLE_ID } = SAMPLE_DATABASE;


test.describe("LOCAL TESTING ONLY > dashboard", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  /**
   * WARNING:
   *    https://github.com/metabase/metabase/issues/15656
   *    - We are currently not able to test translations in CI
   *    - DO NOT unskip this test even after the issue is fixed
   *    - To be used for local testing only
   *    - Make sure you have translation resources built first.
   *        - Run `./bin/i18n/build-translation-resources`
   *        - Then start the server and Cypress tests
   */

  test.skip("dashboard filter should not show placeholder for translated languages (metabase#15694)", async ({ page }) => {
    const { id: USER_ID } = await page.request("GET", "/api/user/current");
    await page.request("PUT", `/api/user/${USER_ID}`, { locale: "fr" });
    const { card_id, dashboard_id } = await createQuestionAndDashboard({
      questionDetails: {
        name: "15694",
        query: { "source-table": PEOPLE_ID },
      },
      dashboardDetails: {
        parameters: [
          {
            name: "Location",
            slug: "location",
            id: "5aefc725",
            type: "string/=",
            sectionId: "location",
          },
        ],
      },
    });

    await addOrUpdateDashboardCard({
      card_id,
      dashboard_id,
      card: {
        parameter_mappings: [
          {
            parameter_id: "5aefc725",
            card_id,
            target: ["dimension", ["field", PEOPLE.STATE, null]],
          },
        ],
      },
    });

    await page.goto(`/dashboard/${dashboard_id}?location=AK&location=CA`);
    await expect(filterWidget()).not.toContainText(/\{0\}/);
  });
});

