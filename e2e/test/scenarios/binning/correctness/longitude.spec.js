import {
  restore,
  popover,
  openPeopleTable,
  summarize,
} from "e2e/support/helpers";

import { LONGITUDE_OPTIONS } from "./shared/constants";


test.describe("scenarios > binning > correctness > longitude", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
    await openPeopleTable(page);
    await summarize(page);
    await openPopoverFromDefaultBucketSize(page, "Longitude", "Auto bin");
  });

  Object.entries(LONGITUDE_OPTIONS).forEach(
    ([bucketSize, { selected, representativeValues }]) => {
      test(`should return correct values for ${bucketSize}`, async ({ page }) => {
        await popover(page).within(async () => {
          await page.locator(`text=${bucketSize}`).click();
        });

        await expect(page.locator("li[aria-selected='true']"))
          .toHaveText(`Longitude${selected}`);

        await page.locator('text=Done').click();

        getTitle(page, `Count by Longitude: ${selected}`);
        await page.locator(".bar");

        assertOnXYAxisLabels(page);
        assertOnXAxisTicks(page, representativeValues);
      });
    },
  );

  test("Don't bin", async ({ page }) => {
    await popover(page).within(async () => {
      await page.locator("text=Don't bin").click();
    });

    await expect(page.locator("li[aria-selected='true']"))
      .toHaveText("LongitudeUnbinned");

    await page.locator('text=Done').click();

    getTitle(page, "Count by Longitude");
    await expect(page.locator(".cellData"))
      .toHaveText("LongitudeCount166.54257260° W1");
  });
});


async function openPopoverFromDefaultBucketSize(page, column, bucket) {
  await page.locator(`[data-testid="dimension-list-item"]:has-text("${column}")`)
    .hover()
    .locator(`[data-testid="dimension-list-item-binning"]:has-text("${bucket}")`)
    .click();
}



async function getTitle(page, title) {
  await page.locator(`text=${title}`);
}



async function assertOnXYAxisLabels(page) {
  await expect(page.locator(".y-axis-label")).toHaveText("Count");
  await expect(page.locator(".x-axis-label")).toHaveText("Longitude");
}



async function assertOnXAxisTicks(page, values) {
  if (values) {
    await page.locator(".axis.x").within(async () => {
      for (const value of values) {
        await page.locator(`text=${value}`);
      }
    });
  } else {
    await expect(page.locator(".axis.x")).not.toBeVisible();
  }
}

