import {
  restore,
  filterWidget,
  visitQuestion,
  downloadAndAssert,
  assertSheetRowsCount,
} from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PEOPLE } = SAMPLE_DATABASE;

const questionData = {
  name: "7210",
  native: {
    query: "SELECT * FROM PEOPLE WHERE {{birthdate}} AND {{source}}",
    "template-tags": {
      birthdate: {
        id: "08c5ea9d-1579-3503-37f1-cbe4d29e6a28",
        name: "birthdate",
        "display-name": "Birthdate",
        type: "dimension",
        dimension: ["field", PEOPLE.BIRTH_DATE, null],
        "widget-type": "date/all-options",
        default: "past30years",
      },
      source: {
        id: "37eb6fa2-3677-91d3-6be0-c5dd9113c672",
        name: "source",
        "display-name": "Source",
        type: "dimension",
        dimension: ["field", PEOPLE.SOURCE, null],
        "widget-type": "string/=",
        default: "Affiliate",
      },
    },
  },
};

const EXPECTED_QUERY_PARAMS = "?birthdate=past30years&source=Affiliate";

test.describe("scenarios > question > public", () => {
  test.beforeEach(async ({ page }) => {
    await intercept("POST", `/api/card/*/query`, "cardQuery");
    await intercept("GET", `/api/public/card/*/query?*`, "publicQuery");

    restore();
    await signInAsAdmin();

    await request("PUT", "/api/setting/enable-public-sharing", { value: true });
  });

  test("adds filters to url as get params and renders the results correctly (metabase#7120, metabase#17033)", async ({ page }) => {
    const id = await createNativeQuestion(questionData);

    await enableSharingQuestion(id);

    await visitQuestion(id);
    // Make sure metadata fully loaded before we continue
    await waitFor("@cardQuery");

    await page.locator('svg[name="share"]').click();

    await visitPublicURL();

    // On page load, query params are added
    await expect(page.url()).toContain("/public/question");
    await expect(page.url()).toContain(EXPECTED_QUERY_PARAMS);

    await filterWidget().toContain("Previous 30 Years");
    await filterWidget().toContain("Affiliate");

    await waitFor("@publicQuery");
    // Name of a city from the expected results
    await page.locator('text=Winner').isVisible();
  });

  test("allows downloading publicly shared questions (metabase#21993)", async ({ page }) => {
    const questionData = {
      name: "21993",
      native: {
        query: "select * from orders",
      },
    };

    const id = await createNativeQuestion(questionData);

    await enableSharingQuestion(id);
    await visitQuestion(id);

    await page.locator('svg[name="share"]').click();
    await visitPublicURL();
    await page.locator('svg[name="download"]').click();

    await page.url().then(url => {
      const publicUid = url.split("/").pop();

      downloadAndAssert(
        { fileType: "xlsx", questionId: id, publicUid },
        assertSheetRowsCount(18760),
      );
    });
  });
});

const visitPublicURL = async ({ page }) => {
  // Ideally we would just find the first input
  // but unless we filter by value
  // Cypress finds an input before the copyable inputs are rendered
  const publicURL = await page.locator('input[value^="http"]').getAttribute("value");

  // Copied URL has no get params
  expect(publicURL).not.toContain(EXPECTED_QUERY_PARAMS);

  await page.goto(publicURL);
};

const enableSharingQuestion = id => {
  cy.request("POST", `/api/card/${id}/public_link`);
};
