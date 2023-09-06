import { restore } from "e2e/support/helpers";

test.describe("scenarios > admin > settings > map settings", () => {
  test.beforeEach(async () => {
    restore();
    cy.signInAsAdmin();
  });

  test("should be able to load and save a custom map", async ({ page }) => {
    await page.goto("/admin/settings/maps");
    await page.click('text="Add a map"');
    await page.fill('input[placeholder="e.g. United Kingdom, Brazil, Mars"]', "Test Map");
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]',
      "https://raw.githubusercontent.com/metabase/metabase/master/resources/frontend_client/app/assets/geojson/world.json");
    await page.click('text="Load"');
    await page.waitForTimeout(2000);
    await page.click('text="Select…"');
    await page.click('text="NAME"');
    await page.click('text="Select…"');
    await page.click('text="NAME"');
    await page.click('text="Add map"');
    await page.waitForTimeout(3000);
    await expect(page.locator('text="NAME"')).not.toBeVisible();
    await page.locator('text="Test Map"');
  });

  test("should be able to load a custom map even if a name has not been added yet (#14635)", async ({ page }) => {
    await page.goto("/admin/settings/maps");
    await page.click('text="Add a map"');
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]',
      "https://raw.githubusercontent.com/metabase/metabase/master/resources/frontend_client/app/assets/geojson/world.json");
    await page.click('text="Load"');
    await page.waitForResponse(response => response.url().includes("/api/geojson") && response.status() === 200);
  });

  test("should show an informative error when adding an invalid URL", async ({ page }) => {
    await page.goto("/admin/settings/maps");
    await page.click('text="Add a map"');
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]', "bad-url");
    await page.click('text="Load"');
    await page.locator('text="Invalid GeoJSON file location: must either start with http:// or https:// or be a relative path to a file on the classpath. URLs referring to hosts that supply internal hosting metadata are prohibited."');
  });

  test("should show an informative error when adding a valid URL that does not contain GeoJSON, or is missing required fields", async ({ page }) => {
    await page.goto("/admin/settings/maps");
    await page.click('text="Add a map"');

    // Not GeoJSON
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]', "https://metabase.com");
    await page.click('text="Load"');
    await page.locator('text="Invalid custom GeoJSON: does not contain features"');

    // GeoJSON with an unsupported format (not a Feature or FeatureCollection)
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]', "");
    await page.fill('input[placeholder="Like https://my-mb-server.com/maps/my-map.json"]',
      "https://raw.githubusercontent.com/metabase/metabase/master/test_resources/test.geojson");
    await page.click('text="Load"');
    await page.locator('text="Invalid custom GeoJSON: does not contain features"');
  });
});
