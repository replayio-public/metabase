import {
  restore,
  visitEmbeddedPage,
  filterWidget,
  visitPublicDashboard,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { REVIEWS, REVIEWS_ID } = SAMPLE_DATABASE;

const ccName = "CC Reviewer";

const dashboardFilter = {
  name: "Text ends with",
  slug: "text_ends_with",
  id: "3a8ecdbd",
  type: "string/ends-with",
  sectionId: "string",
};

const questionDetails = {
  name: "25473",
  query: {
    "source-table": REVIEWS_ID,
    expressions: { [ccName]: ["field", REVIEWS.REVIEWER, null] },
    limit: 10,
    // Let's show only a few columns to make it easier to focus on the UI
    fields: [
      ["field", REVIEWS.REVIEWER, null],
      ["field", REVIEWS.RATING, null],
      ["field", REVIEWS.CREATED_AT, null],
      ["expression", ccName, null],
    ],
  },
};

const dashboardDetails = {
  name: "25473D",
  parameters: [dashboardFilter],
};


test.describe("issue 25473", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await signInAsAdmin();

    const { id, card_id, dashboard_id } = await createQuestionAndDashboard({ questionDetails, dashboardDetails });

    await request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
      cards: [
        {
          id,
          card_id,
          row: 0,
          col: 0,
          size_x: 12,
          size_y: 8,
          series: [],
          visualization_settings: {},
          parameter_mappings: [
            {
              parameter_id: dashboardFilter.id,
              card_id,
              target: ["dimension", ["expression", ccName, null]],
            },
          ],
        },
      ],
    });

    context.dashboardId = dashboard_id;
  });

  test("public sharing: dashboard text filter on a custom column should accept text input (metabase#25473-1)", async ({ page, context }) => {
    visitPublicDashboard(context.dashboardId);

    await assertOnResults(page);
  });

  test("signed embedding: dashboard text filter on a custom column should accept text input (metabase#25473-2)", async ({ page, context }) => {
    await request("PUT", `/api/dashboard/${context.dashboardId}`, {
      embedding_params: {
        [dashboardFilter.slug]: "enabled",
      },
      enable_embedding: true,
    });

    const payload = {
      resource: { dashboard: context.dashboardId },
      params: {},
    };

    visitEmbeddedPage(payload);

    await assertOnResults(page);
  });
});



async function assertOnResults(page) {
  await expect(page.locator('[data-testid="column-header"]').last()).toHaveText(ccName);
  await expect(page.locator(':text("xavier")')).toHaveCount(2);

  await filterWidget().click();
  await page.locator('[placeholder="Enter some text"]').fill('e');
  await page.locator('[placeholder="Enter some text"]').blur();
  await page.locator(':text("Add filter")').click();

  await expect(page.url()).toContain(`?${dashboardFilter.slug}=e`);
  await expect(page.locator(':text("xavier")')).not.toBeVisible();
  await expect(page.locator(':text("cameron.nitzsche")')).toHaveCount(2);
}

