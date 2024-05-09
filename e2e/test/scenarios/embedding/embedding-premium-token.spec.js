import { restore, isOSS } from "e2e/support/helpers";

const embeddingPage = "/admin/settings/embedding-in-other-applications";
const licensePage = "/admin/settings/premium-embedding-license";
const upgradeUrl = "https://www.metabase.com/upgrade";

// A random embedding token with valid format
const embeddingToken =
  "11397b1e60cfb1372f2f33ac8af234a15faee492bbf5c04d0edbad76da3e614a";

const invalidTokenMessage =
  "This token doesn't seem to be valid. Double-check it, then contact support if you think it should be working.";

const discountedWarning =
  "Our Premium Embedding product has been discontinued, but if you already have a license you can activate it here. You’ll continue to receive support for the duration of your license.";


test.describe(
  "scenarios > embedding > premium embedding token",
  () => {
    test.beforeEach(async ({ page }) => {
      if (!isOSS) {
        test.skip();
      }

      restore();
      cy.signInAsAdmin();
    });

    test("should validate a premium embedding token", async ({ page }) => {
      await page.route("PUT", "/api/setting/premium-embedding-token").as(
        "saveEmbeddingToken",
      );

      await page.goto(embeddingPage);
      await page.click('text="Full-app embedding"');

      await page.locator('text=upgradeUrl').click();

      await page.goto(licensePage);

      await page.locator('h1').textContent().should("eq", "Premium embedding");

      await page.locator('text=discountedWarning');

      await page.locator('text="Enter the token you bought from the Metabase Store below."');

      await page.locator('[data-testid="license-input"]').as("tokenInput").should("be.empty");

      await page.locator('@tokenInput').fill("Hi");
      await page.locator('button:text("Activate")').click();

      await page.locator('text=invalidTokenMessage');

      await page.locator('@tokenInput').clear().fill(embeddingToken);
      await page.locator('button:text("Activate")').click();

      await page.locator('text=invalidTokenMessage');

      await page.locator('@tokenInput').clear();
      await page.locator('button:text("Activate")').click();

      await page.locator('text=invalidTokenMessage').should("not.exist");
    });

    test("should be able to set a premium embedding token", async ({ page }) => {
      stubTokenResponses();

      await page.goto(licensePage);

      await page.locator('[data-testid="license-input"]').fill(embeddingToken);
      await page.locator('button:text("Activate")').click();

      await page.locator('text=/Your Premium Embedding license is active until Dec 3(0|1), 2122\./');
    });
  },
);

async function stubTokenResponses() {
  await page.route("PUT", "/api/setting/premium-embedding-token", {
    body: embeddingToken,
  }).as("saveEmbeddingToken");

  const stubbedBody = await page.request("GET", "/api/setting");
  const tokenSetting = stubbedBody.find(
    setting => setting.key === "premium-embedding-token",
  );
  tokenSetting.value = embeddingToken;

  await page.route("GET", "api/setting", stubbedBody).as("getSettings");

  await page.route("GET", "/api/premium-features/token/status", {
    body: {
      valid: true,
      status: "Token is valid.",
      features: ["embedding"],
      trial: false,
      "valid-thru": "2122-12-30T23:00:00Z",
    },
  });
}

async function assertLinkMatchesUrl(text, url) {
  await expect(page.locator(`a:text("${text}")`)).toHaveAttribute("href", url);
}
