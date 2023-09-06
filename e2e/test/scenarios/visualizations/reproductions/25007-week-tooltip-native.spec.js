import { restore, popover } from "e2e/support/helpers";

const questionDetails = {
  name: "11435",
  display: "line",
  native: {
    query: `SELECT dateadd('day', CAST((1 - CASE WHEN ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) = 0 THEN 7 ELSE ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) END) AS long), CAST("PUBLIC"."ORDERS"."CREATED_AT" AS date)) AS "CREATED_AT", count(*) AS "count"
FROM "PUBLIC"."ORDERS"
GROUP BY dateadd('day', CAST((1 - CASE WHEN ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) = 0 THEN 7 ELSE ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) END) AS long), CAST("PUBLIC"."ORDERS"."CREATED_AT" AS date))
ORDER BY dateadd('day', CAST((1 - CASE WHEN ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) = 0 THEN 7 ELSE ((iso_day_of_week("PUBLIC"."ORDERS"."CREATED_AT") + 1) % 7) END) AS long), CAST("PUBLIC"."ORDERS"."CREATED_AT" AS date)) ASC`,
  },
  visualization_settings: {
    "graph.dimensions": ["CREATED_AT"],
    "graph.metrics": ["count"],
  },
};


test.describe("issue 25007", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("should display weeks correctly in tooltips for native questions (metabase#25007)", async ({ page }) => {
    await createNativeQuestion(page, questionDetails, { visitQuestion: true });
    await clickLineDot(page, { index: 1 });
    await popover().findByTextEnsureVisible("May 1 – 7, 2016");
  });
});

const clickLineDot = (async (page, { index } = {}) => {
  await page.locator(".Visualization .dot").nth(index).click({ force: true });
});
