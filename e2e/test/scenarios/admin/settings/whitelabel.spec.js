import { describeEE, restore } from "e2e/support/helpers";

async function checkFavicon(page) {
  const faviconUrl = await page.evaluate(() => {
    return fetch("/api/setting/application-favicon-url").then(response => response.json());
  });
  expect(faviconUrl).toContain("https://cdn.ecosia.org/assets/images/ico/favicon.ico");
}

async function checkLogo(page) {
  const logo_data = await page.locator('img[src^="data:image/jpeg;base64,"]').getAttribute('src');
  expect(logo_data).toBeTruthy();
}

describeEE("formatting > whitelabel", (test) => {
  test.beforeEach(async ({ page }) => {
    await restore(page);
    await cy.signInAsAdmin(page);
  });

  test.describe("company name", () => {
    const COMPANY_NAME = "Test Co";

    test.beforeEach(async ({ page }) => {
      await cy.log("Change company name");
      await cy.visit("/admin/settings/whitelabel");
      await page.locator('input[aria-label="Application Name"]').clear().type(COMPANY_NAME);
      // Helps scroll the page up in order to see "Saved" notification
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Application Name"').click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Saved"');
      await page.locator('input[value="${COMPANY_NAME}"]');
      await cy.log("Company name has been updated!");
    });

    test.skip("should not show the old name in the admin panel (metabase#17043)", async ({ page }) => {
      await page.reload();

      await page.locator('input[value="${COMPANY_NAME}"]');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(
        `text="These are the primary colors used in charts and throughout ${COMPANY_NAME}."`,
      );
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(`text="The top nav bar of ${COMPANY_NAME}."`);

      await page.goto("/admin/settings/general");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator(`text="The name used for this instance of ${COMPANY_NAME}."`);
    });
  });

  test.describe("company logo", () => {
    test.beforeEach(async ({ page }) => {
      await cy.log("Add a logo");
      await cy.readFile("e2e/support/assets/logo.jpeg", "base64").then(async (logo_data) => {
        await page.evaluate(async (logo_data) => {
          await fetch("/api/setting/application-logo-url", {
            method: "PUT",
            body: JSON.stringify({ value: `data:image/jpeg;base64,${logo_data}` }),
            headers: { "Content-Type": "application/json" },
          });
        }, logo_data);
      });
    });

    test("changes should reflect on admin's dashboard", async ({ page }) => {
      await page.goto("/");
      await checkLogo(page);
    });

    test("changes should reflect while signed out", async ({ page }) => {
      await cy.signOut(page);
      await page.goto("/");
      await checkLogo(page);
    });

    test("changes should reflect on user's dashboard", async ({ page }) => {
      await cy.signInAsNormalUser(page);
      await page.goto("/");
      await checkLogo(page);
    });
  });

  test.describe("favicon", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/settings/whitelabel");

      await cy.log("Add favicon");
      await page.locator('input[aria-label="Favicon"]').type(
        "https://cdn.ecosia.org/assets/images/ico/favicon.ico",
      );
      await page.locator("ul").eq(1).click("right");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Saved"');
      await checkFavicon(page);
    });
    test("should show up in user's HTML", async ({ page }) => {
      await cy.signInAsNormalUser(page);
      await page.goto("/");
      await page.locator('head link[rel="icon"]')
        .locator('[href="https://cdn.ecosia.org/assets/images/ico/favicon.ico"]')
        .expect(await page.locator('head link[rel="icon"]')).toHaveCount(1);
    });
  });

  test.describe("loading message", () => {
    test("should update loading message", async ({ page }) => {
      await page.goto("/question/1");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Doing science..."');

      const runningQueryMessage = "Running query...";
      await changeLoadingMessage(page, runningQueryMessage);
      await page.goto("/question/1");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="${runningQueryMessage}"');

      const loadingResultsMessage = "Loading results...";
      await changeLoadingMessage(page, loadingResultsMessage);
      await page.goto("/question/1");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="${loadingResultsMessage}"');
    });
  });

  test.describe("metabot", () => {
    test("should toggle metabot visibility", async ({ page }) => {
      await page.goto("/");
      await page.locator('img[alt="Metabot"]');

      await page.goto("/admin/settings/whitelabel");
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text="Display welcome message on the homepage"').click();

      await page.goto("/");
      await page.locator('img[alt="Metabot"]').expect(await page.locator('img[alt="Metabot"]')).toBeEmpty();
    });
  });

  test.describe("font", () => {
    const font = "Open Sans";
    test.beforeEach(async ({ page }) => {
      await cy.log("Change Application Font");
      await cy.signInAsAdmin(page);
      await setApplicationFontTo(page, font);
    });

    test("should apply correct font", async ({ page }) => {
      await cy.signInAsNormalUser(page);
      await page.goto("/");
      await page.locator("body").expect(await page.locator("body")).toHaveCSS("font-family", `"${font}", sans-serif`);
    });
  });
});

async function changeLoadingMessage(page, message) {
  await page.goto("/admin/settings/whitelabel");
  await page.locator('[data-testid="loading-message-select-button"]').click();
  await page.locator(`text="${message}"`).click();
}

async function setApplicationFontTo(page, font) {
  await page.evaluate(async (font) => {
    await fetch("/api/setting/application-font", {
      method: "PUT",
      body: JSON.stringify({ value: font }),
      headers: { "Content-Type": "application/json" },
    });
  }, font);
}
