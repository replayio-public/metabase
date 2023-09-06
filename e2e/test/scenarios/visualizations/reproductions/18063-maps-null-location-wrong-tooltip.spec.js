import { restore, popover } from "e2e/support/helpers";

const questionDetails = {
  name: "18063",
  native: {
    query:
      'select null "LATITUDE", null "LONGITUDE", null "COUNT", \'NULL ROW\' "NAME"\nunion all select 55.6761, 12.5683, 1, \'Copenhagen\'\n',
    "template-tags": {},
  },
  display: "map",
};


test.describe("issue 18063", () => {
  test.beforeEach(async ({ restore }) => {
    await restore();
    await cy.signInAsAdmin();

    await cy.createNativeQuestion(questionDetails, { visitQuestion: true });

    // Select a Pin map
    await page.locator('[data-testid="viz-settings-button"]').click();
    await page.locator('[data-testid="select-button"]').findByText("Region map").click();

    popover().contains("Pin map").click();

    // Click anywhere to close both popovers that open automatically.
    // Please see: https://github.com/metabase/metabase/issues/18063#issuecomment-927836691
    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    await page.locator(':text("Map type")').click();
  });

  test('should show the correct tooltip details for pin map even when some locations are null (metabase#18063)', async ({ page }) => {
    selectFieldValue("Latitude field", "LATITUDE");
    selectFieldValue("Longitude field", "LONGITUDE");

    await page.locator('.leaflet-marker-icon').dispatchEvent('mousemove');

    popover().within(() => {
      testPairedTooltipValues("LATITUDE", "55.68");
      testPairedTooltipValues("LONGITUDE", "12.57");
      testPairedTooltipValues("COUNT", "1");
      testPairedTooltipValues("NAME", "Copenhagen");
    });
  });
});


async function selectFieldValue(field, value, { page }) {
  await page.locator(`:text("${field}")`).parent().locator(':text("Select a field")').click();

  popover().contains(value).click();
}


function testPairedTooltipValues(val1, val2, { page }) {
  page.locator(`:text("${val1}")`).closest("td").sibling("td").locator(`:text("${val2}")`);
}
