import {
  restore,
  modal,
  describeEE,
  assertPermissionForItem,
  modifyPermission,
  downloadAndAssert,
  assertSheetRowsCount,
  sidebar,
  visitQuestion,
  visitDashboard,
  popover,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

import { SAMPLE_DB_ID, USER_GROUPS } from "e2e/support/cypress_data";

const { ALL_USERS_GROUP } = USER_GROUPS;

const {
  PRODUCTS_ID,
  ORDERS_ID,
  PEOPLE_ID,
  REVIEWS_ID,
  ACCOUNTS_ID,
  ANALYTIC_EVENTS_ID,
  FEEDBACK_ID,
  INVOICES_ID,
} = SAMPLE_DATABASE;

const DATA_ACCESS_PERMISSION_INDEX = 0;
const DOWNLOAD_PERMISSION_INDEX = 2;

describeEE("scenarios > admin > permissions > data > downloads", test.describe("scenarios > admin > permissions > data > downloads", () => {
  beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  test("setting downloads permission UI flow should work", async ({ page }) => {
    cy.log("allows changing download results permission for a database");

    await page.goto(`/admin/permissions/data/database/${SAMPLE_DB_ID}`);

    await modifyPermission(page, "All Users", DOWNLOAD_PERMISSION_INDEX, "No");

    await page.locator('button:text("Save changes")').click();

    await modal(page).within(() => {
      page.locator('text("Save permissions?")');
      page.locator('text("Are you sure you want to do this?")');
      page.locator('button:text("Yes")').click();
    });

    await assertPermissionForItem(page, "All Users", DOWNLOAD_PERMISSION_INDEX, "No");

    cy.log("Make sure we can change download results permission for a table");

    await sidebar(page).contains("Orders").click();

    await modifyPermission(page, "All Users", DOWNLOAD_PERMISSION_INDEX, "1 million rows");

    await page.locator('button:text("Save changes")').click();

    await modal(page).within(() => {
      page.locator('text("Save permissions?")');
      page.locator('text("Are you sure you want to do this?")');
      page.locator('button:text("Yes")').click();
    });

    await assertPermissionForItem(
      page,
      "All Users",
      DOWNLOAD_PERMISSION_INDEX,
      "1 million rows",
    );
  });

  test("respects 'no download' permissions when 'All users' group data permissions are set to `Block` (metabase#22408)", async ({ page }) => {
    await page.goto(`/admin/permissions/data/database/${SAMPLE_DB_ID}`);

    await modifyPermission(page, "All Users", DATA_ACCESS_PERMISSION_INDEX, "Block");

    await page.locator('button:text("Save changes")').click();

    await modal(page).within(() => {
      page.locator('text("Save permissions?")');
      page.locator('text("Are you sure you want to do this?")');
      page.locator('button:text("Yes")').click();
    });

    // When data permissions are set to `Block`, download permissions are automatically revoked
    await assertPermissionForItem(page, "All Users", DOWNLOAD_PERMISSION_INDEX, "No");

    // Normal user belongs to both "data" and "collections" groups.
    // They both have restricted downloads so this user shouldn't have the right to download anything.
    await signInAsNormalUser(page);

    visitQuestion(page, "1");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    page.locator('text("Showing first 2,000 rows")');
    page.locator('icon("download")').should("not.exist");
  });

  test("restricts users from downloading questions", async ({ page }) => {
    // Restrict downloads for All Users
    await updatePermissionsGraph(page, {
      [ALL_USERS_GROUP]: {
        [SAMPLE_DB_ID]: {
          download: { schemas: "none" },
        },
      },
    });

    await signInAsNormalUser(page);

    visitQuestion(page, "1");

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    page.locator('text("Showing first 2,000 rows")');
    page.locator('icon("download")').should("not.exist");

    visitDashboard(page, "1");

    await page.locator('testId("dashcard")').within(() => {
      page.locator('testId("legend-caption")').realHover();
      page.locator('testId("dashcard-menu")').click();
    });

    await popover(page).within(() => {
      page.locator('text("Edit question")').should("be.visible");
      page.locator('text("Download results")').should("not.exist");
    });
  });

  test("limits users from downloading all results", async ({ page }) => {
    const questionId = 1;

    // Restrict downloads for All Users
    await updatePermissionsGraph(page, {
      [ALL_USERS_GROUP]: {
        [SAMPLE_DB_ID]: {
          download: { schemas: "limited" },
        },
      },
    });

    await signInAsNormalUser(page);
    visitQuestion(page, questionId);

    await page.locator('icon("download")').click();

    await downloadAndAssert(
      page,
      { fileType: "xlsx", questionId },
      assertSheetRowsCount(10000),
    );
  });

  test.describe("native questions", () => {
    beforeEach(async ({ page }) => {
      await page.route("POST", "/api/dataset");

      await createNativeQuestion(
        page,
        {
          name: "Native Orders",
          native: {
            query: "select * from orders",
          },
        },
        { wrapId: true, idAlias: "nativeQuestionId" },
      );
    });

    test("lets user download results from native queries", async ({ page }) => {
      await signInAsNormalUser(page);

      await page.locator('@nativeQuestionId').then(async id => {
        visitQuestion(page, id);

        await page.locator('icon("download")').click();

        await downloadAndAssert(
          page,
          { fileType: "xlsx", questionId: id },
          assertSheetRowsCount(18760),
        );

        await page.locator('icon("download")').click();

        // Make sure we can download results from an ad-hoc nested query based on a native question
        await page.locator('text("Explore results")').click();
        await page.waitForResponse("/api/dataset");

        await downloadAndAssert(page, { fileType: "xlsx" }, assertSheetRowsCount(18760));

        // Make sure we can download results from a native model
        await page.request("PUT", `/api/card/${id}`, { name: "Native Model" });

        visitQuestion(page, id);

        await page.locator('icon("download")').click();

        await downloadAndAssert(
          page,
          { fileType: "xlsx", questionId: id },
          assertSheetRowsCount(18760),
        );
      });
    });

    test("prevents user from downloading a native question even if only one table doesn't have download permissions", async ({ page }) => {
      await setDownloadPermissionsForProductsTable(page, "none");

      await signInAsNormalUser(page);

      await page.locator('@nativeQuestionId').then(async id => {
        visitQuestion(page, id);

        page.locator('text("Showing first 2,000 rows")');
        page.locator('icon("download")').should("not.exist");

        // Ad-hoc nested query also shouldn't be downloadable
        await page.locator('text("Explore results")').click();
        await page.waitForResponse("/api/dataset");

        page.locator('text("Showing first 2,000 rows")');
        page.locator('icon("download")').should("not.exist");

        // Convert question to a model, which also shouldn't be downloadable
        await page.request("PUT", `/api/card/${id}`, { name: "Native Model" });

        visitQuestion(page, id);

        page.locator('text("Showing first 2,000 rows")');
        page.locator('icon("download")').should("not.exist");
      });
    });

    test("limits download results for a native question even if only one table has `limited` download permissions", async ({ page }) => {
      await setDownloadPermissionsForProductsTable(page, "limited");

      await signInAsNormalUser(page);

      await page.locator('@nativeQuestionId').then(async id => {
        visitQuestion(page, id);

        await page.locator('icon("download")').click();

        await downloadAndAssert(
          page,
          { fileType: "xlsx", questionId: id },
          assertSheetRowsCount(10000),
        );

        // Ad-hoc nested query based on a native question should also have a download row limit
        await page.locator('text("Explore results")').click();
        await page.waitForResponse("/api/dataset");

        await page.locator('icon("download")').click();

        await downloadAndAssert(page, { fileType: "xlsx" }, assertSheetRowsCount(10000));

        // Convert question to a model, which should also have a download row limit
        await page.request("PUT", `/api/card/${id}`, { name: "Native Model" });

        visitQuestion(page, id);

        await page.locator('icon("download")').click();

        await downloadAndAssert(
          page,
          { fileType: "xlsx", questionId: id },
          assertSheetRowsCount(10000),
        );
      });
    });
  });
}));

async function setDownloadPermissionsForProductsTable(page, permission) {
  await updatePermissionsGraph(page, {
    [ALL_USERS_GROUP]: {
      [SAMPLE_DB_ID]: {
        download: {
          schemas: {
            PUBLIC: {
              [PRODUCTS_ID]: permission,
              [ORDERS_ID]: "full",
              [PEOPLE_ID]: "full",
              [REVIEWS_ID]: "full",
              [ACCOUNTS_ID]: "full",
              [ANALYTIC_EVENTS_ID]: "full",
              [FEEDBACK_ID]: "full",
              [INVOICES_ID]: "full",
            },
          },
        },
      },
    },
  });
}
