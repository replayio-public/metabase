import {
  restore,
  popover,
  modal,
  visitQuestion,
  visitDashboard,
  openQuestionActions,
  rightSidebar,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { PRODUCTS } = SAMPLE_DATABASE;

const COUNT_ALL = "200";
const COUNT_DOOHICKEY = "42";

const PUBLIC_URL_REGEX = /\/public\/(question|dashboard)\/[0-9a-f-]+$/;

const USERS = {
  "admin user": () => cy.signInAsAdmin(),
  "user with no permissions": () => cy.signIn("none"),
  "anonymous user": () => cy.signOut(),
};


test.describe("scenarios > public", () => {
  let questionId;
  before(async () => {
    restore();
    await signInAsAdmin();

    // setup parameterized question
    const { body } = await createNativeQuestion({
      name: "sql param",
      native: {
        query: "select count(*) from products where {{c}}",
        "template-tags": {
          c: {
            id: "e126f242-fbaa-1feb-7331-21ac59f021cc",
            name: "c",
            "display-name": "Category",
            type: "dimension",
            dimension: ["field", PRODUCTS.CATEGORY, null],
            default: null,
            "widget-type": "category",
          },
        },
      },
      display: "scalar",
    });
    questionId = body.id;
  });

  beforeEach(async () => {
    await signInAsAdmin();
  });

  let questionPublicLink;
  let dashboardId;
  let dashboardPublicLink;

  test.describe("questions", () => {
    // Note: Test suite is sequential, so individual test cases can't be run individually
    test('should allow users to create parameterized dashboards', async ({ page }) => {
      // ... (rest of the test cases)
    });

    // ... (rest of the test.describe blocks)
  });
});



async function openDashboardSidebar({ page }) {
  await page.locator("main header").locator('icon[name="info"]').click();
}

