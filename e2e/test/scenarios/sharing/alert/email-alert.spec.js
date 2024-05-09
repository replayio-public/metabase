import { restore, setupSMTP, visitQuestion } from "e2e/support/helpers";


test.describe("scenarios > alert > email_alert", { tags: "@external" }, () => {
  test.beforeEach(async () => {
    test.intercept("POST", "/api/alert").as("savedAlert");

    restore();
    test.signInAsAdmin();

    setupSMTP();
  });

  test("should have no alerts set up initially", async ({ page }) => {
    await page.goto("/");

    const response = await page.request("/api/alert");
    expect(response.body).toHaveLength(0);
  });

  test("should set up an email alert", async ({ page }) => {
    openAlertForQuestion();
    await page.locator('button:has-text("Done")').click();

    await test.waitForResponse("@savedAlert").then(({ response: { body } }) => {
      expect(body.channels).toHaveLength(1);
      expect(body.channels[0].channel_type).toEqual("email");
      expect(body.channels[0].enabled).toEqual(true);
    });
  });

  test("should respect email alerts toggled off (metabase#12349)", async ({ page }) => {
    openAlertForQuestion();

    // Turn off email
    toggleChannel("Email");

    // Turn on Slack
    toggleChannel("Slack");

    await page.locator('button:has-text("Done")').click();

    await test.waitForResponse("@savedAlert").then(({ response: { body } }) => {
      console.log(body);
      expect(body.channels).toHaveLength(2);
      expect(body.channels[0].channel_type).toEqual("email");
      expect(body.channels[0].enabled).toEqual(false);
    });
  });
});



async function openAlertForQuestion(id = 1) {
  await visitQuestion(id);
  await page.locator('icon:has-text("bell")').click();

  await page.locator('text="Set up an alert"').click();
}



async function toggleChannel(channel) {
  await page.locator(`text="${channel}"`).parent().locator("input").click();
}

