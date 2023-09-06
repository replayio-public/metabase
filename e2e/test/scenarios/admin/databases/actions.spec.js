import { restore } from "e2e/support/helpers";
import { WRITABLE_DB_ID, WRITABLE_DB_CONFIG } from "e2e/support/cypress_data";

import { visitDatabase } from "./helpers/e2e-database-helpers";


test.describe(
  "admin > database > external databases > enable actions",
  () => {
    ["mysql", "postgres"].forEach(dialect => {
      test(`should show ${dialect} writable_db with actions enabled`, async ({ page }) => {
        restore(`${dialect}-writable`);
        await signInAsAdmin(page);

        const { response: { body } } = await visitDatabase(WRITABLE_DB_ID);
        expect(body.name).toContain("Writable");
        expect(body.name.toLowerCase()).toContain(dialect);

        expect(body.details.dbname).toEqual(
          WRITABLE_DB_CONFIG[dialect].connection.database,
        );
        expect(body.settings["database-enable-actions"]).toEqual(true);

        await expect(page.locator("#model-actions-toggle")).toHaveAttribute(
          "aria-checked",
          "true",
        );
      });
    });
  },
);
