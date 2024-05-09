import { onlyOn } from "@cypress/skip-test";
import {
  restore,
  visitQuestion,
  saveDashboard,
  popover,
  openNavigationSidebar,
  navigationSidebar,
  openQuestionActions,
  questionInfoButton,
  getPersonalCollectionName,
} from "e2e/support/helpers";

import { USERS } from "e2e/support/cypress_data";

const PERMISSIONS = {
  curate: ["admin", "normal", "nodata"],
  view: ["readonly"],
  no: ["nocollection", "nosql", "none"],
};

test.describe("managing question from the question's details sidebar", () => {
  test.beforeEach(async () => {
    restore();
  });

  Object.entries(PERMISSIONS).forEach(([permission, userGroup]) => {
    test.describe(`${permission} access`, () => {
      userGroup.forEach(user => {
        onlyOn(permission === "curate", () => {
          test.describe(`${user} user`, () => {
            test.beforeEach(async ({ login }) => {
              await login(user);
              visitQuestion(1);
            });

            test('should be able to edit question details (metabase#11719-1)', async ({ page }) => {
              // ... (rest of the test cases)
            });

            // ... (rest of the test cases)
          });
        });

        onlyOn(permission === "view", () => {
          // ... (rest of the test cases)
        });
      });
    });
  });
});

async function clickButton(page, name) {
  const button = await page.locator(`button:has-text("${name}")`);
  await button.isEnabled();
  await button.click();
}

async function assertOnRequest(page, xhr_alias) {
  const response = await page.waitForResponse(xhr_alias);
  expect(response.status()).not.toEqual(403);

  await expect(page.locator('text="Sorry, you don’t have permission to see that."')).toBeHidden();
}

async function turnIntoModel(page) {
  await openQuestionActions(page);
  await page.locator('text="Turn into a model"').click();
  await page.locator('text="Turn this into a model"').click();
}
