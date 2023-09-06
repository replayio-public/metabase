import { restore, setupSMTP } from "e2e/support/helpers";


test.describe("scenarios > pulse", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsAdmin();

    setupSMTP();
  });

  test("should create a new pulse", async ({ page }) => {
    await page.goto("/pulse/create");

    await page.locator('[placeholder="Important metrics"]').click().type("pulse title");

    await page.locator(':text("Select a question")').click();
    await page.locator(':text("Orders, Count")').click();

    await page.locator('[placeholder="Enter user names or email addresses"]')
      .type("bobby@example.test")
      .blur();

    await expect(page.locator(':text("18,760")')).toBeVisible();

    await page.locator(':text("Create pulse")').click();

    await expect(page.url()).toMatch(/\/collection\/root$/);

    await expect(page.locator(':text("pulse title")')).toBeVisible();
  });

  test.describe("existing pulses", () => {
    test.beforeEach(async () => {
      // Create new pulse without relying on the previous test
      await request("POST", "/api/pulse", {
        name: "pulse title",
        cards: [{ id: 2, include_csv: false, include_xls: false }],
        channels: [
          {
            channel_type: "email",
            details: {},
            enabled: true,
            recipients: [{ email: "bobby@example.test" }],
            schedule_day: "mon",
            schedule_frame: "first",
            schedule_hour: 8,
            schedule_type: "daily",
          },
        ],
        skip_if_empty: false,
      });
    });

    test("should load existing pulses", async ({ page }) => {
      await page.goto("/collection/root");
      await page.locator(':text("pulse title")').click({ force: true });
      await expect(page.locator(':text("18,760")')).toBeVisible();
    });

    test("should edit existing pulses", async ({ page }) => {
      await page.goto("/pulse/1");
      await page.locator('[placeholder="Important metrics"]')
        .click()
        .clear()
        .type("new pulse title");

      await page.locator(':text("Save changes")').click();
      await expect(page.url()).toMatch(/\/collection\/root$/);
      await expect(page.locator(':text("new pulse title")')).toBeVisible();
    });
  });
});

