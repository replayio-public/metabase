const cypress = require("cypress");

const {
  executeYarnCommand,
  parseArguments,
  args,
} = require("./cypress-runner-utils");

const isOpenMode = args["--open"];

// Full test suite
// const FOLDERS = ["admin", "binning", "collections", "custom-column", "dashboard", "dashboard-filters", "downloads", "embedding", "filters", "joins", "models", "native", "native-filters", "onboarding", "organization", "permissions", "question", "sharing", "visualizations"];
// Modified test suite
const FOLDERS = [
  //"binning",
  //"collections",
  //"custom-column",
  //"downloads",
  //"embedding",
  "joins",
  //"onboarding",
  //"organization",
  //"permissions",
  //"sharing",
];

const getSpecString = () => {
  return FOLDERS.map(folder => {
    return `./e2e/test/scenarios/${folder}/**/*.cy.spec.js`;
  }).join(",");
};

const runCypress = async (baseUrl, exitFunction) => {
  await executeYarnCommand({
    command: "yarn run clean-cypress-artifacts",
    message: "Removing the existing Cypress artifacts\n",
  });

  const defaultConfig = {
    browser: "chrome",
    configFile: "e2e/support/cypress.config.js",
    config: {
      baseUrl,
    },
    spec: getSpecString(),
  };

  const userArgs = await parseArguments(args);

  const finalConfig = Object.assign({}, defaultConfig, userArgs);

  try {
    const { status, message, totalFailed, failures } = isOpenMode
      ? await cypress.open(finalConfig)
      : await cypress.run(finalConfig);

    // At least one test failed, so let's generate HTML report that helps us determine what went wrong
    if (totalFailed > 0) {
      await executeYarnCommand({
        command: "yarn run generate-cypress-html-report",
        message: "Generating Mochawesome HTML report\n",
      });

      await exitFunction(1);
    }

    // Something went wrong and Cypress failed to even run tests
    if (status === "failed" && failures) {
      console.error(message);

      await exitFunction(failures);
    }
  } catch (e) {
    console.error("Failed to run Cypress!\n", e);

    await exitFunction(1);
  }
};

module.exports = runCypress;
