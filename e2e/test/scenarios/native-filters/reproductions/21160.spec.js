import { restore } from "e2e/support/helpers";

const filterName = "Number comma";

const questionDetails = {
  native: {
    query: "select count(*) from orders where user_id in ({{number_comma}})",
    "template-tags": {
      number_comma: {
        id: "d8870111-7b0f-26f2-81ce-6ec911e54048",
        name: "number_comma",
        "display-name": filterName,
        type: "number",
      },
    },
  },
  display: "scalar",
};


test.describe("issue 21160", () => {
  test.beforeEach(async ({ page }) => {
    restore();
    await signInAsAdmin(page);

    await createNativeQuestion(page, questionDetails, { visitQuestion: true });
  });

  test("number filter should work with values separated by comma (metabase#21160)", async ({ page }) => {
    await getInput(page).type("1,2,3{enter}", { delay: 0 });

    await runQuery(page);
    await resultAssertion(page, "21");

    await getInput(page).clear().type("123,456,789,321{enter}");

    await runQuery(page);
    await resultAssertion(page, "18");
  });
});


async function runQuery(page) {
  await page.locator('[data-testid="qb-header"]').locator('svg[name="play"]').click();

  await page.waitForResponse((response) => response.url().includes('/card/query'));
}


async function resultAssertion(page, res) {
  await expect(page.locator(".ScalarValue").textContent()).toBe(res);
}


function getInput(page) {
  return page.locator(`[placeholder="${filterName}"]`);
}
