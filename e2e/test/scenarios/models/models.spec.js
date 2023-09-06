import {
  restore,
  modal,
  popover,
  openNativeEditor,
  visualize,
  mockSessionProperty,
  sidebar,
  summarize,
  filter,
  filterField,
  visitQuestion,
  visitDashboard,
  startNewQuestion,
  openQuestionActions,
  closeQuestionActions,
  visitCollection,
  undo,
  openQuestionsSidebar,
} from "e2e/support/helpers";

import { SAMPLE_DB_ID } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { questionInfoButton } from "e2e/support/helpers/e2e-ui-elements-helpers";

import {
  turnIntoModel,
  assertIsModel,
  assertQuestionIsBasedOnModel,
  selectFromDropdown,
  selectDimensionOptionFromSidebar,
  saveQuestionBasedOnModel,
  assertIsQuestion,
} from "./helpers/e2e-models-helpers";

const { PRODUCTS } = SAMPLE_DATABASE;

test.describe("scenarios > models", () => {
  test.beforeEach(async ({ restore, signInAsAdmin }) => {
    await restore();
    await signInAsAdmin();
    test.intercept("POST", "/api/dataset").as("dataset");
  });

  test('allows to turn a GUI question into a model', async ({ visitQuestion, turnIntoModel, openQuestionActions, assertIsModel, filter, filterField, saveQuestionBasedOnModel, assertQuestionIsBasedOnModel }) => {
    // ... rest of the test cases
  });

  // ... rest of the test.describe block
});

const getCollectionItemRow = async (itemName) => {
  return await test.locator(`text=${itemName}`).closest("tr");
};

const getCollectionItemCard = async (itemName) => {
  return await test.locator(`text=${itemName}`).parent();
};

const testDataPickerSearch = async ({
  inputPlaceholderText,
  query,
  models = false,
  cards = false,
  tables = false,
} = {}) => {
  await test.locator(`[placeholder="${inputPlaceholderText}"]`).type(query);
  await test.expect('@search');

  if (models) {
    await test.locator('text=/Model in/i').toBeVisible();
  } else {
    await test.locator('text=/Model in/i').toBeHidden();
  }

  if (cards) {
    await test.locator('text=/Saved question in/i').toBeVisible();
  } else {
    await test.locator('text=/Saved question in/i').toBeHidden();
  }

  if (tables) {
    await test.locator('text=/Table in/i').toBeVisible();
  } else {
    await test.locator('text=/Table in/i').toBeHidden();
  }

  await test.locator('icon=close').click();
};
