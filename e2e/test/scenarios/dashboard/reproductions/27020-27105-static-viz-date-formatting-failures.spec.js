import { restore } from "e2e/support/helpers";

const questionDetails27105 = {
  name: "27105",
  native: { query: "select current_date::date, 1", "template-tags": {} },
  display: "table",
  visualization_settings: {
    column_settings: {
      '["name","CAST(CURRENT_DATE AS DATE)"]': {
        date_style: "dddd, MMMM D, YYYY",
      },
    },
    "table.pivot_column": "CAST(CURRENT_DATE AS DATE)",
    "table.cell_column": "1",
  },
};

const questionDetails27020 = {
  name: "27020",
  native: {
    query: 'select current_date as "created_at", 1 "val"',
    "template-tags": {},
  },
  visualization_settings: {
    column_settings: { '["name","created_at"]': { date_abbreviate: true } },
    "table.pivot_column": "created_at",
    "table.cell_column": "val",
  },
};

test.describe("issues 27020 and 27105: static-viz fails to render for certain date formatting options", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();
  });

  test("should render static-viz when date formatting is abbreviated (metabase#27020)", async () => {
    // This is currently the default setting, anyway.
    // But we want to explicitly set it in case something changes in the future,
    // because it is a crucial step for this reproduction.
    await test.request("PUT", "/api/setting/custom-formatting", {
      value: {
        "type/Temporal": {
          date_style: "MMMM D, YYYY",
        },
      },
    });

    assertStaticVizRenders(questionDetails27020);
  });

  test("should render static-viz when date formatting contains day (metabase#27105)", async () => {
    assertStaticVizRenders(questionDetails27105);
  });
});

async function assertStaticVizRenders(questionDetails) {
  const { body: { id } } = await test.createNativeQuestion(questionDetails);
  const { status, body } = await test.request({
    method: "GET",
    url: `/api/pulse/preview_card_png/${id}`,
    failOnStatusCode: false,
  });

  expect(status).toBe(200);
  expect(body).toContain("PNG");
}
