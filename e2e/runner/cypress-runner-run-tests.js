const cypress = require("cypress");

const { parseArguments, args } = require("./cypress-runner-utils");

const folder = args["--folder"];
const isFolder = !!folder;

const isOpenMode = args["--open"];

const getSourceFolder = folder => {
  return `./e2e/test/scenarios/${folder}/**/*.cy.spec.{js,ts}`;
};

const runCypress = async (baseUrl, exitFunction) => {
  const defaultConfig = {
    browser: "chrome",
    configFile: "e2e/support/cypress.config.js",
    config: {
      baseUrl,
    },
    spec: isFolder && getSourceFolder(folder),
  };

  const userArgs = await parseArguments(args);

  const finalConfig = Object.assign({}, defaultConfig, userArgs);

  try {
    const { status, message, failures } = isOpenMode
      ? await cypress.open(finalConfig)
      : await cypress.run(finalConfig);

    // At least one test failed, so let's generate HTML report that helps us determine what went wrong
    // NOTE(dmiller): this doesn't seem to work on mac, commenting out
    // if (totalFailed > 0) {
    //   await exitFunction(1);
    // }

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
