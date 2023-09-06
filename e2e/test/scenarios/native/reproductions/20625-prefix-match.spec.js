import { restore, openNativeEditor } from "e2e/support/helpers";


test.describe("issue 20625", () => {
  test.beforeEach(async ({ context }) => {
    restore();
    await context.signInAsAdmin();
    await context.request("PUT", "/api/setting/native-query-autocomplete-match-style", {
      value: "prefix",
    });
    await context.signInAsNormalUser();
    await context.intercept("GET", "/api/database/*/autocomplete_suggestions**").as(
      "autocomplete",
    );
  });

  test("should continue to request more prefix matches (metabase#20625)", async ({ page, context }) => {
    await openNativeEditor().type("s");

    // autocomplete_suggestions?prefix=s
    await context.waitFor("@autocomplete");

    // can't use page.type because it does not simulate the bug
    await context.realPress("o");

    // autocomplete_suggestions?prefix=so
    await context.waitFor("@autocomplete");
  });
});
