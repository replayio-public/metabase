import { restore } from "e2e/support/helpers";

const questionDetails = {
  name: "27427",
  native: {
    query:
      "select 1 as sortorder, year(current_timestamp), 1 v1, 2 v2\nunion all select 1, year(current_timestamp)-1, 1, 2",
    "template-tags": {},
  },
  display: "bar",
  visualization_settings: {
    "graph.dimensions": ["EXTRACT(YEAR FROM CURRENT_TIMESTAMP)"],
    "graph.metrics": ["V1", "V2"],
    "graph.series_order_dimension": null,
    "graph.series_order": null,
  },
};


test.describe("issue 27427", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("static-viz should not fail if there is unused returned column: 'divide by zero' (metabase#27427)", async ({ page }) => {
    await assertStaticVizRender(page, questionDetails, ({ status, body }) => {
      expect(status).toBe(200);
      expect(body).not.toContain(
        "An error occurred while displaying this card.",
      );
    });
  });
});



async function assertStaticVizRender(page, questionDetails, callback) {
  const { id } = await createNativeQuestion(page, questionDetails);
  const response = await page.evaluate(async (id) => {
    const res = await fetch(`/api/pulse/preview_card/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const body = await res.text();
    return { status: res.status, body };
  }, id);

  callback(response);
}

