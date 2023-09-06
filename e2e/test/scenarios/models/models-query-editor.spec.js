import {
  restore,
  runNativeQuery,
  summarize,
  popover,
  openQuestionActions,
} from "e2e/support/helpers";

import { selectFromDropdown } from "./helpers/e2e-models-helpers";

test.describe("scenarios > models query editor", () => {
  test.beforeEach(async () => {
    test.intercept("PUT", "/api/card/*").as("updateCard");
    test.intercept("POST", "/api/dataset").as("dataset");
    test.intercept("POST", "/api/card/*/query").as("cardQuery");

    restore();
    test.signInAsAdmin();
  });

  test.describe("GUI models", () => {
    test.beforeEach(async () => {
      test.request("PUT", "/api/card/1", {
        name: "Orders Model",
        dataset: true,
      });
    });

    test('allows to edit GUI model query', async ({ page }) => {
      // ... (rest of the test code)
    });

    test('allows for canceling changes', async ({ page }) => {
      // ... (rest of the test code)
    });

    test('locks display to table', async ({ page }) => {
      // ... (rest of the test code)
    });
  });

  test.describe("native models", () => {
    test('allows to edit native model query', async ({ page }) => {
      // ... (rest of the test code)
    });

    test('allows for canceling changes', async ({ page }) => {
      // ... (rest of the test code)
    });

    test('handles failing queries', async ({ page }) => {
      // ... (rest of the test code)
    });
  });
});
