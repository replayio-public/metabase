import { restore, popover, startNewQuestion } from "e2e/support/helpers";


test.describe("operators in questions", () => {
  test.beforeEach(async () => {
    restore();
    await signInAsNormalUser();
  });

  const expected = {
    text: {
      expected: [
        "Is",
        "Is not",
        "Contains",
        "Does not contain",
        "Is empty",
        "Not empty",
        "Starts with",
        "Ends with",
      ],
      unexpected: ["Is null", "Not null"],
    },
    number: {
      expected: [
        "Equal to",
        "Not equal to",
        "Greater than",
        "Less than",
        "Between",
        "Greater than or equal to",
        "Less than or equal to",
        "Is empty",
        "Not empty",
      ],
      unexpected: ["Is null", "Not null"],
    },
    relativeDates: {
      expected: ["Past", "Next", "Current"],
      unexpected: ["Is null", "Not null"],
    },
    specificDates: {
      expected: ["Before", "After", "On", "Between"],
      unexpected: ["Is null", "Not null"],
    },
    excludeDates: {
      expected: [
        "Days of the week...",
        "Months of the year...",
        "Quarters of the year...",
        "Hours of the day...",
        "Is empty",
        "Is not empty",
      ],
      unexpected: ["Is null", "Not null"],
    },
    id: {
      expected: ["Is", "Is not", "Is empty", "Not empty"],
      unexpected: ["Is null", "Not null"],
    },
    geo: {
      expected: ["Is", "Is not"],
      unexpected: ["Is null", "Not null"],
    },
  };

  test.describe("fields have proper operators", () => {
    test("text operators", async ({ page }) => {
      await startNewQuestion();
      await page.click('text=Sample Database');
      await page.click('text=Products');
      await page.click('text=Add filters to narrow your answer');

      await popover().within(async () => {
        await page.click('text=Title');
        await page.click('text=Is');
      });

      await page.locator('[data-testid="operator-select-list"]').within(async () => {
        for (const e of expected.text.expected) {
          await expect(page.locator(`text=${e}`)).toBeVisible();
        }
        for (const e of expected.text.unexpected) {
          await expect(page.locator(`text=${e}`)).not.toBeVisible();
        }
      });
    });

    test("number operators", async ({ page }) => {
      await startNewQuestion();
      await page.click('text=Sample Database');
      await page.click('text=Products');
      await page.click('text=Add filters to narrow your answer');

      await popover().within(async () => {
        await page.click('text=Price');
        await page.click('text=Equal to');
      });

      await page.locator('[data-testid="operator-select-list"]').within(async () => {
        for (const e of expected.number.expected) {
          await expect(page.locator(`text=${e}`)).toBeVisible();
        }
        for (const e of expected.number.unexpected) {
          await expect(page.locator(`text=${e}`)).not.toBeVisible();
        }
      });
    });

    // Add the remaining test cases for relativeDates, specificDates, excludeDates, id, and geo operators
  });
});
