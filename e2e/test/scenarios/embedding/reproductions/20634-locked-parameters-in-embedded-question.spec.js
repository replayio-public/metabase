import { restore, visitIframe } from "e2e/support/helpers";


test.describe("locked parameters in embedded question (metabase#20634)", () => {
  test.beforeEach(async () => {
    await test.fixtures.restore();
    await test.fixtures.signInAsAdmin();

    await test.fixtures.createNativeQuestion(
      {
        name: "20634",
        native: {
          query: "select {{text}}",
          "template-tags": {
            text: {
              id: "abc-123",
              name: "text",
              "display-name": "Text",
              type: "text",
              default: null,
            },
          },
        },
      },
      { visitQuestion: true },
    );
  });

  test("should let the user lock parameters to specific values", async ({ page }) => {
    await page.locator('svg[name="share"]').click();
    await page.locator('button:has-text("Embed in your application")').click();

    await page.locator('.Modal--full').within(async () => {
      await page.locator(':text("Text")').parent().within(async () => {
        await page.locator(':text("Disabled")').click();
      });
    });

    await page.locator(':text("Locked")').click();

    await page.locator('.Modal--full').within(async () => {
      await page.locator('input[placeholder="Text"]').fill('foo');
      await page.locator('input[placeholder="Text"]').press('Enter');

      await page.locator(':text("Publish")').click();
      await page.waitForResponse("PUT", "/api/card/*");
    });

    await visitIframe();

    await expect(page.locator(':text("Text")')).not.toBeVisible();
    await page.locator('.CardVisualization').within(async () => {
      await expect(page.locator(':text("foo")')).toBeVisible();
    });
  });
});

