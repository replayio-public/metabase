const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");

function getSecret(key) {
  return execSync(
    `aws secretsmanager get-secret-value --secret-id "${key}" --region us-east-2 --output json --query "SecretString"`,
  )
    .toString()
    .trim()
    .replaceAll('"', "");
}

function setSecrets() {
  const rawOS = os.platform();
  const rawArch = os.arch();
  const osPlatform = rawOS === "win32" ? "windows" : rawOS;
  const osArch = rawArch === "x64" ? "x86" : rawArch;

  const osArchString = `${osPlatform}-${osArch}`;
  const RECORD_REPLAY_API_KEY = `prod/metabase-${osArchString}-replay-api-key`;

  const secrets = {
    FLY_ACCESS_TOKEN: "prod/fly-api-token",
    RECORD_REPLAY_API_KEY,
  };

  // for each secret, set the environment variable if it isn't set by calling getSecret
  Object.entries(secrets).forEach(([envVar, secretName]) => {
    if (!process.env[envVar]) {
      process.env[envVar] = getSecret(secretName);
    }
  });
}

const generateRandomString = (length = 6) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const runCommandWithEnv = (command, env = {}) => {
  console.log(`$ ${command}`);
  execSync(command, { stdio: "inherit", env: { ...process.env, ...env } });
};

function getPlatform() {
  switch (os.platform()) {
    case "linux":
      return "linux";
    case "darwin":
      return "macOS";
    case "win32":
      return "windows";
  }

  throw new Error(`Unsupported platform: ${os.platform()}`);
}

function getLatestBuildIdForPlatform(platform) {
  return new Promise((resolve, reject) => {
    https
      .get("https://app.replay.io/api/releases", res => {
        let data = "";
        res.on("data", chunk => {
          data += chunk;
        });
        res.on("end", () => {
          const json = JSON.parse(data);
          const latest = json
            .filter(
              release =>
                release.platform === platform && release.runtime === "chromium",
            )
            .sort(
              (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
            )
            .pop();
          if (!latest) {
            reject(new Error("Failed to find build for " + platform));
          } else {
            resolve(latest.buildId);
          }
        });
      })
      .on("error", err => {
        reject(err);
      });
  });
}

(async () => {
  setSecrets();
  try {
    runCommandWithEnv("yarn install");

    const currentDir = process.cwd();
    const recordReplayDir = path.join(currentDir, ".replay");
    process.env.RECORD_REPLAY_DIRECTORY = recordReplayDir;

    if (!fs.existsSync(path.join(recordReplayDir, "runtimes"))) {
      const ret = fs.mkdirSync(path.join(recordReplayDir, "runtimes"), {
        recursive: true,
      });
      console.log(`mkdir ret: ${ret}`);
    }
    if (!fs.existsSync(path.join(recordReplayDir, "runtimes"))) {
      throw new Error("Directory was not created successfully.");
    }
    console.log(
      `Directories created up to: ${path.join(recordReplayDir, "runtimes")}`,
    );

    console.log(
      `Directories created up to: ${path.join(recordReplayDir, "runtimes")}`,
    );

    // if not set in buildkite meta-data, use environment variable
    let runtimeBuildId;
    try {
      const buildId = execSync("buildkite-agent meta-data get build-id", {
        encoding: "utf8",
      }).trim();
      runtimeBuildId = buildId;
    } catch (e) {
      console.log(`Error getting build ID from buildkite: ${e}`);
      console.log("Continuing...");
    }
    if (runtimeBuildId) {
      runtimeBuildId = process.env.RUNTIME_BUILD_ID;
    } else {
      runtimeBuildId = await getLatestBuildIdForPlatform(getPlatform());
    }

    process.env.RUNTIME_BUILD_ID = runtimeBuildId;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), ""));
    process.on("exit", () => fs.rmdirSync(tmpDir, { recursive: true }));

    let buildFile;
    if (process.platform === "win32") {
      buildFile = `${runtimeBuildId}.zip`;
    } else if (process.arch === "x64") {
      buildFile = `${runtimeBuildId}.tar.xz`;
    } else if (process.arch === "arm64") {
      buildFile = `${runtimeBuildId}-arm.tar.xz`;
    } else {
      throw new Error(
        `Unsupported platform: ${process.platform} ${process.arch}`,
      );
    }

    const buildUrl = `https://static.replay.io/downloads/${buildFile}`;

    console.log(`Downloading build from ${buildUrl}`);

    const file = fs.createWriteStream(path.join(tmpDir, buildFile));
    https.get(buildUrl, response => {
      response.pipe(file);
    });
    // Extract build
    fs.mkdirSync(path.join(tmpDir, "build"));
    execSync(
      `tar xf ${path.join(tmpDir, buildFile)} -C ${path.join(tmpDir, "build")}`,
    );

    // Set Chrome binary path based on OS
    let chromeDir;
    let destDirName;
    if (os.platform() === "linux") {
      chromeDir = path.join(tmpDir, "build", "replay-chromium");
      destDirName = "replay-chromium";
    } else if (os.platform() === "darwin") {
      chromeDir = path.join(tmpDir, "build", "Replay-Chromium.app");
      destDirName = "Replay-Chromium.app";
    } else if (os.platform() === "win32") {
      chromeDir = path.join(tmpDir, "build", "replay-chromium");
      destDirName = "replay-chromium";
    } else {
      throw new Error(`Unsupported platform: ${os.platform()}`);
    }

    const destPath = path.join(recordReplayDir, "runtimes", destDirName);
    console.log(
      `Moving unpacked chrome directory: ${chromeDir} to ${destPath}`,
    );
    fs.renameSync(chromeDir, destPath);
    process.on("exit", () => fs.rmdirSync(destPath, { recursive: true }));

    const randomString = generateRandomString();

    const cleanup = () => {
      runCommandWithEnv(`fly apps destroy replay-mb-${randomString} -y`);
    };

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    runCommandWithEnv(
      `fly app create --name replay-mb-${randomString} -o replay`,
    );
    runCommandWithEnv(
      `fly deploy -a replay-mb-${randomString} -c fly.toml --vm-size shared-cpu-4x --ha=false`,
    );
    runCommandWithEnv(
      `yarn test-cypress-run --e2e --browser replay-chromium --folder collections`,
      {
        CYPRESS_REPLAYIO_ENABLED: "1",
        E2E_HOST: `https://replay-mb-${randomString}.fly.dev`,
        QA_DB_ENABLED: "false",
      },
    );

    runCommandWithEnv(
      "node_modules/.bin/replay metadata --init --keys source --warn",
    );

    const outputString = execSync("node_modules/.bin/replay ls").toString();
    console.log(`outputString: ${outputString}`);
    // grab first column of output
    const recordingIds = outputString
      .split("\n")
      .map(line => line.split(" ")[0]);
    // drop first element (header)
    recordingIds.shift();
    console.log("recordingIds", recordingIds);

    try {
      runCommandWithEnv("node_modules/.bin/replay upload-all");
    } catch (e) {
      console.log(`Error uploading all recordings: ${e}`);
      console.log("Continuing...");
    }

    // call replay process on each recording ID
    let errorProcessingRecording = false;
    recordingIds.forEach(recordingId => {
      try {
        runCommandWithEnv(`node_modules/.bin/replay process ${recordingId}`);
      } catch (e) {
        errorProcessingRecording = true;
        console.log(`Error processing recording ${recordingId}: ${e}`);
      }
    });

    if (errorProcessingRecording) {
      throw new Error("Error processing recording");
    }
  } catch (err) {
    console.error(err);
  }
})();
