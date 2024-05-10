import { spawnSync } from "child_process";
import * as fs from "fs";
import * as process from "process";
import { pipeline } from "stream";

function spawnChecked(cmd, args, options) {
  const prettyCmd = [cmd].concat(args).join(" ");
  console.log("$ " + prettyCmd);

  const rv = spawnSync(cmd, args, options);

  if (rv.status != 0 || rv.error) {
    console.group(`Spawn FAILED (${rv.error || ""}) - All output:\n`);
    const stdout = rv.stdout ? rv.stdout.toString() : "";
    const stderr = rv.stderr ? rv.stderr.toString() : "";
    const allOutput = `${stdout} ${stderr}`.trim();
    if (allOutput) {
      console.error(allOutput);
    }
    console.groupEnd();
    throw new Error(`Spawned process failed with exit code ${rv.status}`);
  }

  return rv;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    die(`${name} is not set in the environment`);
  }
  return value;
}

function env(name) {
  return process.env[name];
}

function die(message) {
  console.error(message);
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const DRY_RUN = !!env("DRY_RUN");

function fetchBuildId() {
  if (DRY_RUN) {
    return fs.readFileSync("./dryrun/build_id/linux/x86_64/build_id", "utf8");
  }
  try {
    spawnChecked("buildkite-agent", [
      "artifact",
      "download",
      "build_id/linux/x86_64/build_id",
      "./",
      "--build",
      BUILDKITE_TRIGGERED_FROM_BUILD_ID,
    ]);
    return fs.readFileSync("./build_id/linux/x86_64/build_id", "utf8");
  } catch (e) {
    die("Failed to fetch build id from buildkite artifacts");
  }
}

const GITHUB_AUTH_SECRET = requireEnv("GITHUB_AUTH_SECRET");
const BUILDKITE_BRANCH = requireEnv("BUILDKITE_BRANCH");
const BUILDKITE_BUILD_ID = requireEnv("BUILDKITE_BUILD_ID");
const BUILDKITE_TRIGGERED_FROM_BUILD_PIPELINE_SLUG = requireEnv(
  "BUILDKITE_TRIGGERED_FROM_BUILD_PIPELINE_SLUG",
);
const BUILDKITE_TRIGGERED_FROM_BUILD_NUMBER = requireEnv(
  "BUILDKITE_TRIGGERED_FROM_BUILD_NUMBER",
);
const BUILDKITE_TRIGGERED_FROM_BUILD_ID = requireEnv(
  "BUILDKITE_TRIGGERED_FROM_BUILD_ID",
);
const RUN_ID = `${BUILDKITE_TRIGGERED_FROM_BUILD_PIPELINE_SLUG}/${BUILDKITE_TRIGGERED_FROM_BUILD_NUMBER}`;
const BUILD_ID = fetchBuildId();

function isHTTP2xx(status_code) {
  return status_code >= 200 && status_code < 300;
}

const githubHeaders = {
  Authorization: `Bearer ${GITHUB_AUTH_SECRET}`,
  "X-GitHub-Api-Version": "2022-11-28",
};
const githubJSONHeaders = {
  ...githubHeaders,
  Accept: "application/vnd.github.v3+json",
}


async function githubGetJSON(url) {
  const resp = await fetch(url, {
    method: "GET",
    headers: githubJSONHeaders,
  });
  if (!isHTTP2xx(resp.status)) {
    throw new Error(`Github API request failed with status ${resp.status}`);
  }
  return await resp.json();
}

async function githubAPIDownload(url, filename) {
  const resp = await fetch(url, {
    method: "GET",
    headers: githubHeaders,
  });
  if (!isHTTP2xx(resp.status)) {
    throw new Error(`Github API request failed with status ${resp.status}`);
  }
  const fileStream = fs.createWriteStream(filename, { flags: 'wx'});
  await new Promise((resolve, reject) => pipeline(
    [resp.body, fileStream],
    (err) => {
      if (err) {
        console.error('download pipeline failed.', err);
        reject(err);
      } else {
        console.log('download pipeline succeeded.');
        resolve();
      }
    }
  ));
  console.log("done downloading");
}

async function githubAPIPost(url, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers: githubJSONHeaders,
    body,
  });
  if (!isHTTP2xx(resp.status)) {
    throw new Error(`Github API request failed with status ${resp.status}`);
  }
  return resp;
}

const WORKFLOW_DISPATCH_START_RUN_URL = () => `https://api.github.com/repos/replayio-public/metabase/actions/workflows/e2e-tests.yml/dispatches`;
const WORKFLOW_DISPATCH_RUNS_URL = () => `https://api.github.com/repos/replayio-public/metabase/actions/runs?event=workflow_dispatch`;
const WORKFLOW_RUN_JOBS_URL = (run_id) => `https://api.github.com/repos/replayio-public/metabase/actions/runs/${run_id}/jobs`;
const WORKFLOW_RUN_ARTIFACTS_URL = (run_id) => `https://api.github.com/repos/replayio-public/metabase/actions/runs/${run_id}/artifacts`
const WORKFLOW_ARTIFACT_URL = (artifact_id) => `https://api.github.com/repos/replayio-public/metabase/actions/artifacts/${artifact_id}/zip`

async function fetchRunsJSON() {
  if (DRY_RUN) {
    return JSON.parse(fs.readFileSync("./dryrun/runs.json", "utf8"));
  } else {
    return await githubGetJSON(WORKFLOW_DISPATCH_RUNS_URL());
  }
}

async function fetchRunJobsJSON(run_id) {
  if (DRY_RUN) {
    return JSON.parse(fs.readFileSync(`./dryrun/jobs-${run_id}.json`, "utf8"));
  } else {
    return await githubGetJSON(WORKFLOW_RUN_JOBS_URL(run_id));
  }
}

async function fetchRunArtifactsJSON(run_id) {
  if (DRY_RUN) {
    return JSON.parse(fs.readFileSync(`./dryrun/artifacts-${run_id}.json`, "utf8"));
  } else {
    return await githubGetJSON(WORKFLOW_RUN_ARTIFACTS_URL(run_id));
  }
}

async function fetchRunArtifact(artifact_id, filename) {
  if (DRY_RUN) {
    spawnChecked("cp", [`./dryrun/artifact-${artifact_id}.zip`, filename]);
  } else {
    return await githubAPIDownload(
      WORKFLOW_ARTIFACT_URL(artifact_id),
      filename,
    );
  }
}

function annotate(context, message, style = "info") {
  if (DRY_RUN) {
    console.log(`DRY RUN: annotation:\n${message}`);
  } else {
    spawnChecked("buildkite-agent", [
      "annotate",
      "--context",
      context,
      "--style",
      style,
      message,
    ]);
  }
}

async function startWorkflowRun() {
  const body = {
    ref: BUILDKITE_BRANCH,
    inputs: {
      runId: RUN_ID,
      replayBrowserOnly: true,
      "chromium-build-id": BUILD_ID,
    }
  };

  console.log(
    "Running metabase tests on GitHub with payload: " + JSON.stringify(body),
  );

  if (!DRY_RUN) {
    try {
      await githubAPIPost(WORKFLOW_DISPATCH_START_RUN_URL(), JSON.stringify(body));
    } catch (e) {
      // TODO: we should retry this on error
      die(`Failed to start workflow run: ${e}`);
    }
  }
}

async function waitForRunCompletion(expectedRunName) {
  // these values should give us ~50 minutes of wait time, which should be wayyy more than enough (previous
  // runs have taken ~20 minutes)
  const SLEEP_SEC_PER_ITER = 60;
  const ITER_COUNT = 50;

  let url_annotation_done = false;
  let iter = 0;

  while (iter <= ITER_COUNT) {
    iter++;
    console.log(
      `Iteration ${iter}, sleeping for ${SLEEP_SEC_PER_ITER} seconds...`,
    );
    await sleep(SLEEP_SEC_PER_ITER * 1000);

    let runs_json;
    try {
      runs_json = await fetchRunsJSON();
    } catch (e) {
      console.log(`Failed to fetch runs JSON: ${e}`);
      // don't exit here since retrying is so easy - we'll just try again after SLEEP_SEC_PER_ITER.
      continue;
    }

    const run_json = runs_json.workflow_runs.find(
      run => run.name === expectedRunName,
    );

    if (!run_json) {
      console.log(`Run '${expectedRunName}' not present in workflow run list`);
      continue;
    }

    const run_id = run_json.id;
    const run_status = run_json.status;
    const run_conclusion = run_json.conclusion;
    const run_url = run_json.html_url;

    if (!url_annotation_done) {
      url_annotation_done = true;
      console.log(`Github workflow run url: ${run_url}`);
      annotate("run_url", run_url);
    }

    if (run_status === "completed") {
      console.log(
        `Github workflow completed with conclusion: ${run_conclusion}`,
      );
      return [run_conclusion, run_id];
    } else {
      console.log(`Run status was ${run_status}, continuing to poll...`);
      continue;
    }
  }

  console.error("GH workflow run didn't complete in time.  failing this step.");
  console.error(
    "If builds need to take longer, increase the iteration count or sleep time per iteration",
  );
  return ["timeout", null];
}

async function fetchReportAndGatherFailures(report_name, artifact) {
  const zip_file = `${report_name}.zip`;

  try {
    await fetchRunArtifact(artifact.id, zip_file);
  } catch (e) {
    // TODO: we should probably retry this on http error
    die(`Failed to fetch artifact ${artifact.id}: ${e}`);
  }

  const files = fs.readdirSync(".");
  console.log("files after downloading artifact: " + files.join(" "));

  spawnChecked("mkdir", [report_name]);
  process.chdir(report_name);
  try {
    spawnChecked("unzip", ["-o", `../${zip_file}`]);
    const files = fs.readdirSync(".");
    const fail_files = files.filter(file => file.match(/^fail-.*\.json$/));
    if (fail_files.length === 0) {
      die(`No fail-*.json files found in ${report_name}`);
    }

    const failures = [];
    for (const fail_file of fail_files) {
      const fail_json = JSON.parse(fs.readFileSync(fail_file, "utf8"));

      for (const result of fail_json.results) {
        failures.push({
          file: result.file,
          suites: result.suites.map(suite => ({
            title: suite.title,
            tests: suite.tests.filter(test => test.fail).map(test => test.title),
          })).filter(suite => suite.tests.length > 0),
        });
      }
    }
    return failures;
  } finally {
    process.chdir("..");
  }
}

function formatFailures(job_name, failures) {
  let failuresBlob = "";
  for (const failure of failures) {
    failuresBlob += `### ${failure.file}\n`;
    for (const suite of failure.suites) {
      failuresBlob += `#### ${suite.title}\n`;
      for (const test of suite.tests) {
        failuresBlob += `* ${test}\n`;
      }
      failuresBlob += "\n";
    }
    failuresBlob += "\n";
  }

  return `## ${job_name} failures\n${failuresBlob}`;
}

function formatFailureMissingReport(job_name) {
  return (
    `## ${job_name} failed without a report\n` +
    "This likely means the recorder crashed for all tests, so there were no report to upload."
  )
}

async function main() {
  await startWorkflowRun();

  const expectedRunName = `E2E Tests (aggregate) - run id ${RUN_ID}`;
  console.log(`Expected workflow run name: ${expectedRunName}`);

  let run_id;
  let status;

  try {
    [status, run_id] = await waitForRunCompletion(expectedRunName);
  } catch (e) {
    die(`Failed to wait for workflow run completion: ${e}`);
  }

  if (status === "timeout") {
    die("Timed out waiting for workflow run completion");
  }

  if (status === "success") {
    console.log("workflow succeeded.  nothing more to do here.");
    process.exit(0);
  }

  console.log(
    "workflow failed.  gathering info from artifacts and failing this step.",
  );

  // fetch the jobs list so we can tell which ones failed
  let jobs_json;
  try {
    jobs_json = await fetchRunJobsJSON(run_id);
  } catch (e) {
    // TODO: we should probably retry this on http error
    die(`Failed to fetch jobs JSON: ${e}`);
  }
  const failed_test_jobs = jobs_json.jobs.filter(job => {
    if (job.status !== "completed" || job.conclusion !== "failure") {
      console.log(`Job ${job.name} was not a failed job, skipping... ${job.status}, ${job.conclusion}`)
      return false;
    }
    if (!job.name.match(/^e2e-tests-.*-ee$/)) {
      console.log(`Job ${job.name} does not match naming pattern, skipping...`)
      return false;
    }
    // now we make sure that 3.2 failed
    return job.steps.some(step => {
      if (
        // TODO: add a pattern to the command line for the test we're looking for?
        !step.name.startsWith("3.2) Run EE Cypress tests on")
        || !step.name.includes("using Replay.io browser")
      ) {
        return false;
      }
      return step.conclusion === "failure";
    });
  });

  if (failed_test_jobs.length === 0) {
    die(
      "TODO: we failed, but not due to a failed test job.  what do we do here?",
    );
  }

  let artifacts_json;
  try {
    artifacts_json = await fetchRunArtifactsJSON(run_id);
  } catch (e) {
    // TODO: we should probably retry this on http error
    die(`Failed to fetch artifacts JSON: ${e}`);
  }

  for (const job of failed_test_jobs) {
    // find the artifact that corresponds to this job's name
    const report_name = `${job.name}-report`;
    const report_artifact = artifacts_json.artifacts.find(
      artifact => artifact.name === report_name,
    );

    if (report_artifact) {
      const failures = await fetchReportAndGatherFailures(report_name, report_artifact);
      annotate(report_name, formatFailures(job.name, failures), "error");
    } else {
      annotate(report_name, formatFailureMissingReport(job.name), "error");
    }
  }

  process.exit(-1);
}

main();
