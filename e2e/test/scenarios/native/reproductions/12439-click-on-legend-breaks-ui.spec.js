import { restore, visitQuestionAdhoc, sidebar } from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const nativeQuery = `
SELECT "PRODUCTS__via__PRODUCT_ID"."CATEGORY" AS "CATEGORY",
       date_trunc('month', "ORDERS"."CREATED_AT") AS "CREATED_AT",
       count(*) AS "count"
FROM "ORDERS"
LEFT JOIN "PRODUCTS" "PRODUCTS__via__PRODUCT_ID"
       ON "ORDERS"."PRODUCT_ID" = "PRODUCTS__via__PRODUCT_ID"."ID"
GROUP BY "PRODUCTS__via__PRODUCT_ID"."CATEGORY",
         date_trunc('month', "ORDERS"."CREATED_AT")
ORDER BY "PRODUCTS__via__PRODUCT_ID"."CATEGORY" ASC,
         date_trunc('month', "ORDERS"."CREATED_AT") ASC
`;

const questionDetails = {
  dataset_query: {
    database: SAMPLE_DB_ID,
    native: {
      query: nativeQuery,
    },
    type: "native",
  },
  display: "line",
};


test.describe("issue 12439", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    visitQuestionAdhoc(questionDetails);
  });

  test("should allow clicking on a legend in a native question without breaking the UI (metabase#12439)", async ({ page }) => {
    await page.locator(".Visualization").within(async () => {
      await page.locator(":text('Gizmo')").click();

      // Make sure the legends and the graph are still there
      await expect(page.locator(":text('Gizmo')")).toBeVisible();
      await expect(page.locator(":text('Doohickey')")).toBeVisible();

      await page.locator("circle");
    });

    // Make sure buttons are clickable
    await page.locator("[data-testid='viz-settings-button']").click();

    await sidebar().contains("X-axis");
    await sidebar().contains("Y-axis");
  });
});

