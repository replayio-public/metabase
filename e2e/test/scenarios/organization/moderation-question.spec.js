import {
  describeEE,
  restore,
  visitQuestion,
  openQuestionActions,
  questionInfoButton,
  getFullName,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const { admin } = USERS;
const adminFullName = getFullName(admin);

describeEE("scenarios > saved question moderation", () => {
  test.describe("as an admin", () => {
    test.beforeEach(async () => {
      restore();
      cy.signInAsAdmin();
    });

    test('should be able to verify and unverify a saved question', async ({ page }) => {
      visitQuestion(2);

      verifyQuestion();

      // 1. Question title
      await expect(page.locator('[data-testid="qb-header-left-side"]').locator('.Icon-verified')).toBeVisible();

      // 2. Question's history
      questionInfoButton().click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=History');
      await expect(page.locator('text=You verified this')).toHaveCount(2);

      // 3. Recently viewed list
      await page.locator('[placeholder="Search…"]').click();
      await expect(page.locator('[data-testid="recently-viewed-item"]').locator('.Icon-verified')).toBeVisible();

      // 4. Search results
      await page.locator('[placeholder="Search…"]').fill('orders{enter}');
      await expect(page.locator('[data-testid="search-result-item"]').locator('text=Orders, Count').locator('.Icon-verified')).toBeVisible();

      // 5. Question's collection
      await page.goto('/collection/root');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count').locator('a').locator('.Icon-verified')).toBeVisible();

      // Let's go back to the question and remove the verification
      visitQuestion(2);

      removeQuestionVerification();

      // 1. Question title
      await expect(page.locator('[data-testid="qb-header-left-side"]').locator('.Icon-verified')).not.toBeVisible();

      // 2. Question's history
      questionInfoButton().click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=History');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=You removed verification');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=You verified this'); // Implicit assertion - there can be only one :)

      // 3. Recently viewed list
      await page.locator('[placeholder="Search…"]').click();
      await expect(page.locator('[data-testid="recently-viewed-item"]').locator('.Icon-verified')).not.toBeVisible();

      // 4. Search results
      await page.locator('[placeholder="Search…"]').fill('orders{enter}');
      await expect(page.locator('[data-testid="search-result-item"]').locator('text=Orders, Count').locator('.Icon-verified')).not.toBeVisible();

      // 5. Question's collection
      await page.goto('/collection/root');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count').locator('a').locator('.Icon-verified')).not.toBeVisible();
    });
  });

  test.describe("as a non-admin user", () => {
    test.beforeEach(async () => {
      restore();
      cy.signInAsAdmin();

      cy.createModerationReview({
        status: "verified",
        moderated_item_type: "card",
        moderated_item_id: 2,
      });

      cy.signInAsNormalUser();
    });

    test('should be able to see that a question has not been verified', async ({ page }) => {
      visitQuestion(3);

      await expect(page.locator('.Icon-verified')).not.toBeVisible();

      questionInfoButton().click();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await page.locator('text=${adminFullName} verified this').not.toBeVisible();

      await page.locator('[placeholder="Search…"]').fill('orders{enter}');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count, Grouped by Created At (year)').locator('.Icon-verified')).not.toBeVisible();

      await page.goto('/collection/root');

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count, Grouped by Created At (year)').locator('.Icon-verified')).not.toBeVisible();
    });

    test('should be able to see that a question has been verified', async ({ page }) => {
      visitQuestion(2);

      await expect(page.locator('.Icon-verified')).toBeVisible();

      questionInfoButton().click();
      await expect(page.locator('text=${adminFullName} verified this')).toBeVisible();

      await page.locator('[placeholder="Search…"]').fill('orders{enter}');
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count').locator('parent').locator('.Icon-verified')).toBeVisible();

      await page.goto('/collection/root');

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      await expect(page.locator('text=Orders, Count').locator('td').locator('.Icon-verified')).toBeVisible();
    });
  });
});

async function verifyQuestion() {
  const loadCard = page.waitForResponse("/api/card/*");

  openQuestionActions();
  await page.locator('text=Verify this question').click();

  const { response: { body } } = await loadCard;
  const { moderation_reviews } = body;

  /**
   * According to Dan's analysis, the reason behind intermittent failures in this test
   * could be the errors in H2 (app db).
   * More info: https://metaboat.slack.com/archives/C505ZNNH4/p1657300770484219?thread_ts=1657295926.728949&cid=C505ZNNH4
   *
   * We observed that even when the click on "Verify this question" was successful,
   * the response still shows `moderation_reviews` as an empty array.
   *
   * Therefore, we have to conditionally skip this test if that error occurs.
   */
  if (Array.isArray(moderation_reviews) && moderation_reviews.length === 0) {
    test.skip();
  } else {
    const [{ status }] = moderation_reviews;

    expect(status).toEqual("verified");
  }
}

async function removeQuestionVerification() {
  openQuestionActions();
  await page.locator('text=Remove verification').click();
}
