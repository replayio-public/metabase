import { restore, isEE } from "e2e/support/helpers";

const TOOLS_ERRORS_URL = "/admin/tools/errors";

// The filter is required but doesn't have a default value set
const brokenQuestionDetails = {
  name: "Broken SQL",
  native: {
    "template-tags": {
      filter: {
        id: "ce8f111c-24c4-6823-b34f-f704404572f1",
        name: "filter",
        "display-name": "Filter",
        type: "text",
        required: true,
      },
    },
    query: "select {{filter}}",
  },
  display: "scalar",
};

// Quarantine the whole spec because it is most likely causing the H2 timeouts and the chained failures!
// NOTE: it will be quarantined on PRs, but will still run on `master`!

// UDATE:
// We need to skip this completely! CI on `master` is almost constantly red.
// TODO:
// Once the underlying problem with H2 is solved, replace `describe.skip` with `describeEE`.
describe.skip(
  "admin > tools > erroring questions ",
  { tags: "@quarantine" },
  (() => {
    beforeEach(async ({ page }) => {
      cy.onlyOn(isEE);

      restore();
      cy.signInAsAdmin();

      cy.intercept("POST", "/api/dataset").as("dataset");
    });

    describe("without broken questions", () => {
      it.skip('should render the "Tools" tab and navigate to the "Erroring Questions" by clicking on it', async ({ page }) => {
        // The sidebar has been taken out, because it looks awkward when there's only one elem on it: put it back in when there's more than one
        await page.goto("/admin");

        await page.locator("nav").locator("text=Tools").click();

        expect(await page.url()).toContain(TOOLS_ERRORS_URL);
        await expect(page.locator('a[role="link"]').locator("text=Erroring Questions")).toHaveAttribute("href", TOOLS_ERRORS_URL);
      });

      it("should disable search input fields (metabase#18050)", async ({ page }) => {
        await page.goto(TOOLS_ERRORS_URL);

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator("text=No results");
        await expect(page.locator('button:text("Rerun Selected")')).toBeDisabled();
        await expect(page.locator('input[placeholder="Error contents"]')).toBeDisabled();
        await expect(page.locator('input[placeholder="DB name"]')).toBeDisabled();
        await expect(page.locator('input[placeholder="Collection name"]')).toBeDisabled();
      });
    });

    describe("with the existing broken questions", () => {
      beforeEach(async () => {
        cy.createNativeQuestion(brokenQuestionDetails, {
          loadMetadata: true,
        });

        await page.goto(TOOLS_ERRORS_URL);
      });

      it("should render correctly", async ({ page }) => {
        await page.waitForResponse("@dataset");

        await selectQuestion(brokenQuestionDetails.name);

        await expect(page.locator('button:text("Rerun Selected")')).not.toBeDisabled();
        await page.locator('button:text("Rerun Selected")').click();

        await page.waitForResponse("@dataset");

        // The question is still there because we didn't fix it
        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator(`text=${brokenQuestionDetails.name}`);
        await expect(page.locator('button:text("Rerun Selected")')).toBeDisabled();

        await expect(page.locator('input[placeholder="Error contents"]')).not.toBeDisabled();
        await expect(page.locator('input[placeholder="DB name"]')).not.toBeDisabled();
        await expect(page.locator('input[placeholder="Collection name"]')).not.toBeDisabled();
        await page.locator('input[placeholder="Collection name"]').fill("foo");

        await page.waitForResponse("@dataset");

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator("text=No results");
      });

      it("should remove fixed question on a rerun", async () => {
        await fixQuestion(brokenQuestionDetails.name);

        await page.goto(TOOLS_ERRORS_URL);

        await selectQuestion(brokenQuestionDetails.name);

        await expect(page.locator('button:text("Rerun Selected")')).not.toBeDisabled();
        await page.locator('button:text("Rerun Selected")').click();

        await page.waitForResponse("@dataset");

        // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
        await page.locator("text=No results");
      });
    });
  },
);

async function fixQuestion(name) {
  await page.goto("/collection/root");
  await page.locator(`text=${name}`).click();
  await page.locator("text=Open Editor").click();

  await page.locator('i[aria-label="variable"]').click();
  await page.locator('input[placeholder="Enter a default value…"]').fill("Foo");

  await page.locator("text=Save").click();

  await page.locator(".Modal").within(() => {
    await page.locator('button:text("Save")').click();
  });
}

async function selectQuestion(name) {
  await page.locator(`text=${name}`)
    .closest("tr")
    .within(() => {
      await page.locator('input[role="checkbox"]').check().should("be.checked");
    });
}
