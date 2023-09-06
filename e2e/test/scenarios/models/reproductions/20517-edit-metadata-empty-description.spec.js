import { restore } from "e2e/support/helpers";


test.describe("issue 20517", () => {
  test.beforeEach(async ({ context }) => {
    context.updateCard = test.intercept("PUT", "/api/card/1");

    restore();
    cy.signInAsAdmin();

    cy.request("PUT", "/api/card/1", { dataset: true });
  });

  test("should be able to save metadata changes with empty description (metabase#20517)", async ({ page, context }) => {
    await page.goto("/model/1/metadata");

    await page.locator('input[aria-label="Description"]').clear().blur();

    await page.locator('button:text("Save changes")').click();

    const updateCardResponse = await context.updateCard.waitForResponse();
    const responseBody = await updateCardResponse.json();
    const statusCode = updateCardResponse.status();

    expect(statusCode).not.to.eq(400);
    expect(responseBody.errors).not.to.exist;

    await expect(page.locator('button:text("Save failed")')).not.toBeVisible();
  });
});

