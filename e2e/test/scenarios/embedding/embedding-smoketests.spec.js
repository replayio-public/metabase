import {
  restore,
  visitQuestion,
  isEE,
  isOSS,
  visitDashboard,
  visitIframe,
} from "e2e/support/helpers";

const embeddingPage = "/admin/settings/embedding-in-other-applications";
const licenseUrl = "https://metabase.com/license/embedding";
const upgradeUrl = "https://www.metabase.com/upgrade";
const learnEmbeddingUrl =
  "https://www.metabase.com/learn/embedding/embedding-charts-and-dashboards.html";

const licenseExplanations = [
  `When you embed charts or dashboards from Metabase in your own application, that application isn't subject to the Affero General Public License that covers the rest of Metabase, provided you keep the Metabase logo and the "Powered by Metabase" visible on those embeds.`,
  `Your should, however, read the license text linked above as that is the actual license that you will be agreeing to by enabling this feature.`,
];


test.describe("scenarios > embedding > smoke tests", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test.describe("embedding disabled", () => {
    test.beforeEach(() => {
      // We enable embedding by default in the default snapshot that all tests are using.
      // That's why we need to disable it here.
      resetEmbedding();
    });

    test("should display the embedding page correctly", { tags: "@OSS" }, async ({ page }) => {
      await page.goto("/admin/settings/setup");
      await sidebar().within(() => {
        page.locator('text="Embedding"').click();
      });

      await expect(page.locator('pathname')).toEqual(embeddingPage);

      // Some info we provide to users before they enable embedding
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="More details"');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="By enabling embedding you\'re agreeing to"');

      assertLinkMatchesUrl("our embedding license.", licenseUrl);

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="More details"').click();
      licenseExplanations.forEach(licenseExplanation => {
        page.locator('text=licenseExplanation');
      });

      await page.locator('button="Enable"').click();

      // Let's examine the contents of the enabled embedding page (the url stays the same)
      await expect(page.locator('pathname')).toEqual(embeddingPage);

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Allow questions, dashboards, and more to be embedded. Learn more."');
      assertLinkMatchesUrl("Learn more.", learnEmbeddingUrl);
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Enabled"');

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Standalone embeds"').click();
      if (isOSS) {
        await page.locator('text="In order to remove the Metabase logo from embeds, you can always upgrade to one of our paid plans."');

        assertLinkMatchesUrl("one of our paid plans.", upgradeUrl);
      }

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Embedding secret key"');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Standalone Embed Secret Key used to sign JSON Web Tokens for requests to /api/embed endpoints. This lets you create a secure environment limited to specific users or organizations."');

      getTokenValue().should("have.length", 64);

      await page.locator('button="Regenerate key"');

      // List of all embedded dashboards and questions
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Embedded dashboards"');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="No dashboards have been embedded yet."');

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Embedded questions"');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="No questions have been embedded yet."');

      // Full app embedding section (available only for EE version and in PRO hosted plans)
      if (isEE) {
        await sidebar().within(() => {
          page.locator('text="Embedding"').click();
        });
        await page.locator('text="Full-app embedding"').click();
        await page.locator('text="Embedding the entire Metabase app"');
        await page.locator('text="With this Pro/Enterprise feature you can embed the full Metabase app. Enable your users to drill-through to charts, browse collections, and use the graphical query builder. Learn more."');
        await page.locator('text="Enter the origins for the websites or web apps where you want to allow embedding, separated by a space. Here are the exact specifications for what can be entered."');
        await page.locator('placeholder="https://*.example.com"').should("be.empty");
      }
    });

    test("should not let you embed the question", async () => {
      visitQuestion("1");
      await page.locator('icon="share"').click();

      ensureEmbeddingIsDisabled();
    });

    test("should not let you embed the dashboard", async () => {
      visitDashboard(1);

      await page.locator('icon="share"').click();

      ensureEmbeddingIsDisabled();
    });
  });

  test.describe("embedding enabled", { tags: "@OSS" }, () => {
    ["question", "dashboard"].forEach(object => {
      test(`should be able to publish/embed and then unpublish a ${object} without filters`, async ({ page }) => {
        const embeddableObject = object === "question" ? "card" : "dashboard";
        const objectName =
          object === "question" ? "Orders" : "Orders in a dashboard";

        await page.route("PUT", `/api/${embeddableObject}/1`).as("embedObject");
        await page.route("GET", `/api/${embeddableObject}/embeddable`).as(
          "currentlyEmbeddedObject",
        );

        visitAndEnableSharing(object);

        if (isEE) {
          await page.locator('text="Font"');
        }

        if (isOSS) {
          await page.locator('text="Font"').should("not.exist");
        }

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="Parameters"');
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="This (question|dashboard) doesn\'t have any parameters to configure yet."');

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="You will need to publish this (question|dashboard) before you can embed it in another application."');

        await page.locator('button="Publish"').click();
        await page.waitForResponse("@embedObject");

        visitIframe();

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text=objectName');
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="37.65"');

        if (isOSS) {
          await page.locator('text="Powered by Metabase"')
            .closest("a")
            .should("have.attr", "href")
            .and("eq", "https://metabase.com/");
        } else {
          await page.locator('text="Powered by Metabase"').should("not.exist");
        }

        signInAsAdmin();

        await page.goto(embeddingPage);
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="Standalone embeds"').click();
        await page.waitForResponse("@currentlyEmbeddedObject");

        const sectionName = new RegExp(`Embedded ${object}s`, "i");

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text=sectionName')
          .closest("li")
          .locator("tbody tr")
          .should("have.length", 1)
          .and("contain", objectName);

        visitAndEnableSharing(object);

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="Danger zone"');
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="This will disable embedding for this (question|dashboard)."');

        await page.locator('button="Unpublish"').click();
        await page.waitForResponse("@embedObject");

        visitIframe();
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="Embedding is not enabled for this object."');

        signInAsAdmin();

        await page.goto(embeddingPage);
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="Standalone embeds"').click();
        await page.waitForResponse("@currentlyEmbeddedObject");

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator('text="No (questions|dashboards) have been embedded yet."');
      });
    });
  });

  test("should not offer to share or embed models (metabase#20815)", async ({ page }) => {
    await page.route("POST", "/api/dataset").as("dataset");

    await page.request("PUT", "/api/card/1", { dataset: true });

    await page.goto("/model/1");
    await page.waitForResponse("@dataset");

    await page.locator('icon="share"').should("not.exist");
  });
});



async function resetEmbedding() {
  await page.request("PUT", "/api/setting/enable-embedding", { value: false });
  await page.request("PUT", "/api/setting/embedding-secret-key", {
    value: null,
  });
}



async function getTokenValue() {
  return await page.locator("#setting-embedding-secret-key").getAttribute("value");
}



async function enableSharing() {
  await page.locator('text="Enable sharing"').sibling().click();
}



async function assertLinkMatchesUrl(text, url) {
  await expect(page.locator(`a:text("${text}")`))
    .toHaveAttribute("href")
    .and("contain", url);
}



async function ensureEmbeddingIsDisabled() {
  // This is implicit assertion - it would've failed if embedding was enabled
  await page.locator('text="Embed in your application"').closest(".disabled");

  // Let's make sure embedding stays disabled after we enable public sharing
  await enableSharing();

  await page.locator('text="Embed in your application"').closest(".disabled");
}



async function visitAndEnableSharing(object) {
  if (object === "question") {
    visitQuestion("1");
    await page.locator('icon="share"').click();
    await page.locator('text="Embed in your application"').click();
  }

  if (object === "dashboard") {
    visitDashboard(1);

    await page.locator('icon="share"').click();
    await page.locator('text="Embed in your application"').click();
  }
}



function sidebar() {
  return page.locator(".AdminList");
}

