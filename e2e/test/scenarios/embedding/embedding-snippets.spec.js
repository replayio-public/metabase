import {
  restore,
  popover,
  visitDashboard,
  visitQuestion,
  isEE,
} from "e2e/support/helpers";

import { JS_CODE, IFRAME_CODE } from "./shared/embedding-snippets";


test.describe("scenarios > embedding > code snippets", () => {
  test.beforeEach(async () => {
    restore();
    signInAsAdmin();
  });

  test("dashboard should have the correct embed snippet", async ({ page }) => {
    await visitDashboard(1);
    await page.locator('icon[name="share"]').click();
    await page.locator('text="Embed in your application"').click();
    await page.locator('text="Code"').click();

    await page.locator('text="To embed this dashboard in your application:"');
    await page.locator('text="Insert this code snippet in your server code to generate the signed embedding URL"');

    await expect(page.locator('.ace_content').first()).toHaveText(JS_CODE({ type: "dashboard" }));

    await page.locator('text="Transparent"').click();
    await expect(page.locator('.ace_content').first()).toHaveText(JS_CODE({ type: "dashboard", theme: "transparent" }));

    await page.locator('aria-label="Enable users to download data from this embed?"').should('not.exist');

    await expect(page.locator('.ace_content').last()).toHaveText(IFRAME_CODE);

    await page.locator('testId="embed-backend-select-button"').should('contain', 'Node.js').click();

    await popover()
      .should("contain", "Node.js")
      .and("contain", "Ruby")
      .and("contain", "Python")
      .and("contain", "Clojure");

    await page.locator('testId="embed-frontend-select-button"').should('contain', 'Mustache').click();

    await popover()
      .should("contain", "Mustache")
      .and("contain", "Pug / Jade")
      .and("contain", "ERB")
      .and("contain", "JSX");
  });

  test("question should have the correct embed snippet", async ({ page }) => {
    await visitQuestion(1);
    await page.locator('icon[name="share"]').click();
    await page.locator('text="Embed in your application"').click();
    await page.locator('text="Code"').click();

    await page.locator('text="To embed this question in your application:"');
    await page.locator('text="Insert this code snippet in your server code to generate the signed embedding URL"');

    await expect(page.locator('.ace_content').first()).toHaveText(JS_CODE({ type: "question" }));

    await page.locator('text="Transparent"').click();
    await expect(page.locator('.ace_content').first()).toHaveText(JS_CODE({ type: "question", theme: "transparent" }));

    if (isEE) {
      await page.locator('aria-label="Enable users to download data from this embed?"').click();

      await expect(page.locator('.ace_content').first()).toHaveText(JS_CODE({
        type: "question",
        theme: "transparent",
        hideDownloadButton: true,
      }));
    }

    await expect(page.locator('.ace_content').last()).toHaveText(IFRAME_CODE);

    await page.locator('testId="embed-backend-select-button"').should('contain', 'Node.js').click();

    await popover()
      .should("contain", "Node.js")
      .and("contain", "Ruby")
      .and("contain", "Python")
      .and("contain", "Clojure");

    await page.locator('testId="embed-frontend-select-button"').should('contain', 'Mustache').click();

    await popover()
      .should("contain", "Mustache")
      .and("contain", "Pug / Jade")
      .and("contain", "ERB")
      .and("contain", "JSX");
  });
});

