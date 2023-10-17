const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const runCommandWithEnv = (command, env = {}) => {
  console.log(`$ ${command}`);
  execSync(command, { stdio: "inherit", env: { ...process.env, ...env } });
};

// Function to download files
const download = (url, destination) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https
      .get(url, response => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", err => {
        fs.unlink(destination);
        reject(err.message);
      });
  });
};

(async () => {
  try {
    runCommandWithEnv("yarn install");

    const currentDir = process.cwd();
    const recordReplayDir = path.join(currentDir, ".replay");
    process.env.RECORD_REPLAY_DIRECTORY = recordReplayDir;

    if (!fs.existsSync(recordReplayDir)) {
      fs.mkdirSync(path.join(recordReplayDir, "runtimes"), { recursive: true });
    }

    const dmgFile = path.join(
      recordReplayDir,
      "runtimes",
      "Replay-Chromium.app.dmg",
    );
    await download(
      "https://static.replay.io/downloads/macOS-chromium-20230916-e7589a401ac1-4d0a9f5b9de2.dmg",
      dmgFile,
    );

    runCommandWithEnv(`hdiutil attach ${dmgFile}`);
    runCommandWithEnv(
      `cp -R /Volumes/Replay-Chromium/Replay-Chromium.app ${path.join(
        recordReplayDir,
        "runtimes",
        "Replay-Chromium.app",
      )}`,
    );
    runCommandWithEnv("hdiutil detach /Volumes/Replay-Chromium");

    const cleanup = () => {
      runCommandWithEnv(
        `fly apps destroy replay-mb-${process.env.BUILDKITE_BUILD_NUMBER} -y`,
      );
    };

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    runCommandWithEnv(
      `fly app create --name replay-mb-${process.env.BUILDKITE_BUILD_NUMBER} -o replay`,
    );
    runCommandWithEnv(
      `fly deploy -a replay-mb-${process.env.BUILDKITE_BUILD_NUMBER} -c fly.toml --vm-size shared-cpu-4x --ha=false`,
    );
    runCommandWithEnv(
      `yarn test-cypress-run --e2e --browser replay-chromium --folder collections`,
      {
        CYPRESS_REPLAYIO_ENABLED: "1",
        E2E_HOST: `https://replay-mb-${process.env.BUILDKITE_BUILD_NUMBER}.fly.dev`,
        QA_DB_ENABLED: "false",
      },
    );

    runCommandWithEnv(
      "node_modules/.bin/replay metadata --init --keys source --warn",
    );
    runCommandWithEnv("node_modules/.bin/replay upload-all");
  } catch (err) {
    console.error(err);
  }
})();
