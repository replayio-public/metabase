import { restore, visitQuestionAdhoc } from "e2e/support/helpers";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";


test.describe("visual tests > visualizations > map", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  const customGeoJsonUrl =
    "https://raw.githubusercontent.com/metabase/metabase/master/resources/frontend_client/app/assets/geojson/world.json";
  const testMapName = "My Test Map";

  const saveCustomMap = () => {
    cy.request("PUT", "/api/setting/custom-geojson", {
      value: {
        "my-test-map-id": {
          name: testMapName,
          url: customGeoJsonUrl,
          region_key: "NAME",
          region_name: "NAME",
        },
      },
    });
  };

  test("properly displays custom maps in settings", async ({ page }) => {
    await page.goto("/admin/settings/maps");

    await page.locator('[data-testid="custom-geojson-setting"]').locator("text=Add a map").click();

    await page.locator('[data-testid="edit-map-modal"]').within(() => {
      page.locator('input[placeholder="e.g. United Kingdom"]').fill(testMapName);
      page.locator('input[placeholder="my-map.json"]').fill(customGeoJsonUrl);
      page.locator('button:text("Load")').click();
    });

    await page.locator('[data-testid="loading-spinner"]').should("not.exist");
    await page.locator('label:text("hourglass icon")').should("not.exist");
    await page.locator(".leaflet-container").should("be.visible");

    cy.createPercySnapshot();
  });

  test("properly displays custom map in query builder", async ({ page }) => {
    saveCustomMap();

    const testQuery = {
      type: "native",
      native: {
        query:
          "SELECT 'Brazil' region, 23 val UNION " +
          "SELECT 'Algeria' region, 42 val;",
      },
      database: SAMPLE_DB_ID,
    };

    visitQuestionAdhoc({
      dataset_query: testQuery,
      display: "map",
      visualization_settings: {
        "map.region": "my-test-map-id",
      },
    });

    await page.locator('[data-testid="loading-spinner"]').should("not.exist");
    await page.locator('label:text("hourglass icon")').should("not.exist");
    await page.locator(".leaflet-container").should("be.visible");

    cy.createPercySnapshot();
  });
});

