import { restore, openNativeEditor, runNativeQuery } from "e2e/support/helpers";

const nativeQuery = "select (random() * random() * random()), pg_sleep(2)";

/**
 * Disabled and quarantined until we fix the caching issues, and especially:
 * https://github.com/metabase/metabase/issues/13262
 */
describe.skip(
  "scenarios > admin > settings > cache",
  { tags: "@external" },
  (() => {
    test.beforeEach(async () => {
      await test.fixtures.intercept("POST", "/api/dataset").as("dataset");
      await test.fixtures.intercept("POST", "/api/card/*/query").as("cardQuery");

      restore("postgres-12");
      cy.signInAsAdmin();
    });

    test.describe("issue 18458", () => {
      test.beforeEach(async () => {
        await test.page.goto("/admin/settings/caching");

        enableCaching();

        setCachingValue("Minimum Query Duration", "1");
        setCachingValue("Cache Time-To-Live (TTL) multiplier", "2");

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await test.page.locator("text=Saved");

        // Run the query and save the question
        openNativeEditor({ databaseName: "QA Postgres12" }).type(nativeQuery);
        runNativeQuery();

        getCellText().then(res => {
          cy.wrap(res).as("tempResult");
        });

        saveQuestion("18458");
      });

      test("should respect previously set cache duration (metabase#18458)", async () => {
        refreshUntilCached();

        cy.get("@cachedResult").then(cachedValue => {
          /**
           * 5s is longer than what we set the cache to last:
           * Approx 2s for an Average Runtime x multiplier of 2.
           *
           * The cache should expire after 4s and we should see a new random result.
           */
          cy.wait(5000);

          refresh();

          getCellText().then(newValue => {
            expect(newValue).to.not.eq(cachedValue);
          });
        });
      });
    });
  },
);

async function enableCaching() {
  await test.page.locator("text=Disabled")
    .parent()
    .within(async () => {
      await test.page.locator("role=switch").click();
    });

  await test.page.locator("text=Enabled");
}

async function setCachingValue(field, value) {
  await test.page.locator(`text=${field}`).closest("li").locator("input").type(value).blur();
}

async function saveQuestion(name) {
  await test.fixtures.intercept("POST", "/api/card").as("saveQuestion");

  await test.page.locator("text=Save").click();

  await test.page.locator("aria-label=Name").type(name);

  await test.page.locator(".Modal").button("Save").click();

  await test.page.locator("text=Not now").click();

  await test.page.waitForResponse("@saveQuestion");
}

async function getCellText() {
  return await test.page.locator(".cellData").eq(-1).textContent();
}

async function refresh() {
  await test.page.locator("icon=refresh").first().click();
  await test.page.waitForResponse("@cardQuery");
}

async function refreshUntilCached(loop = 0) {
  if (loop > 5) {
    throw new Error("Caching mechanism seems to be broken.");
  }

  refresh();

  getCellText().then(res => {
    cy.get("@tempResult").then(temp => {
      if (res === temp) {
        cy.wrap(res).as("cachedResult");
      } else {
        cy.wrap(res).as("tempResult");

        refreshUntilCached(++loop);
      }
    });
  });
}
