import { withSampleDatabase } from "e2e/support/helpers";

it("should generate metadata", async ({ page }) => {
  await signInAsAdmin(page);

  withSampleDatabase(SAMPLE_DATABASE => {
    fs.writeFileSync("e2e/support/playwright_sample_database.json", JSON.stringify(SAMPLE_DATABASE));
  });
});
