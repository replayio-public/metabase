import {
  popover,
  restore,
  visitDashboard,
  modal,
  dashboardHeader,
} from "e2e/support/helpers";

test.describe("scenarios > home > homepage", () => {
  test.beforeEach(async () => {
    // Replace cy.intercept with appropriate intercepts for Playwright
  });

  test.describe("after setup", () => {
    test.beforeEach(async () => {
      restore("setup");
    });

    test('should display x-rays for the sample database', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });

    test('should display x-rays for a user database', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });

    test('should allow switching between multiple schemas for x-rays', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });
  });

  test.describe("after content creation", () => {
    test.beforeEach(async () => {
      restore("default");
    });

    test('should display recent items', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });

    test('should display popular items for a new user', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });

    test('should not show pinned questions in recent items when viewed in a collection', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });
  });
});

test.describe("scenarios > home > custom homepage", () => {
  test.describe("setting custom homepage", () => {
    test.beforeEach(async () => {
      restore();
      // Replace cy.signInAsAdmin with appropriate Playwright command
    });

    test('should give you the option to set a custom home page in settings', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });

    test('should give you the option to set a custom home page using home page CTA', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });
  });

  test.describe("custom homepage set", () => {
    test.beforeEach(async () => {
      restore();
      // Replace cy.signInAsAdmin and cy.request with appropriate Playwright commands
    });

    test('should redirect you if you do not have permissions for set dashboard', async ({ page }) => {
      // Replace Cypress commands with Playwright commands
    });
  });
});

const pinItem = name => {
  cy.findByText(name).closest("tr").icon("ellipsis").click();

  popover().icon("pin").click();
};

const getXrayCandidates = () => [
  {
    id: "1/public",
    schema: "public",
    tables: [{ title: "Orders", url: "/auto/dashboard/table/1" }],
  },
  {
    id: "1/private",
    schema: "private",
    tables: [{ title: "People", url: "/auto/dashboard/table/2" }],
  },
];
