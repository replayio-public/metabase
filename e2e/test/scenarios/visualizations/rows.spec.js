import { restore } from "e2e/support/helpers";


test.describe("scenarios > visualizations > rows", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);
  });

  // Until we enable multi-browser support, this repro will be skipped by Playwright in CI
  // Issue was specific to Firefox only - it is still possible to test it locally
  ["0", "null"].forEach(testValue => {
    test(
      `should not collapse rows when last value is ${testValue} (metabase#14285)`,
      async ({ page }) => {
        await createNativeQuestion(
          page,
          {
            name: "14285",
            native: {
              query: `
              with temp as (
                select 'a' col1, 25 col2 union all
                select 'b', 10 union all
                select 'c', 15 union all
                select 'd', ${testValue} union all
                select 'e', 30 union all
                select 'f', 35
              ) select * from temp
              order by 2 desc
            `,
              "template-tags": {},
            },
            display: "row",
          },
          { visitQuestion: true },
        );

        await page.locator(".Visualization").within(async () => {
          ["a", "b", "c", "d", "e", "f"].forEach(async (letter) => {
            await page.locator(`text=${letter}`);
          });
        });
      },
    );
  });
});

