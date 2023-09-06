import {
  restore,
  modal,
  popover,
  describeEE,
  getFullName,
} from "e2e/support/helpers";
import { USERS } from "e2e/support/cypress_data";

const { normal, nocollection } = USERS;

const noCollectionUserName = getFullName(nocollection);
const normalUserName = getFullName(normal);

describeEE("scenarios > admin > people", test.describe('scenarios > admin > people', () => {);

async function confirmLosingAbilityToManageGroup() {
  await modal().within(async () => {
    await page.locator(
      "You will not be able to manage users of this group anymore.",
    );
    await page.locator('[data-testid="button"]').locator('Confirm').click();
  });
}

async function removeFirstGroup() {
  await page.locator('[data-testid="ellipsis"]').eq(0).click();
  await page.locator('Remove Group').click();
  await page.locator('[data-testid="button"]').locator('Yes').click();
}
