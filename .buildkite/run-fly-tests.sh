#!/bin/bash
set -euo pipefail

cleanup() {
    # destroy the fly app
    fly apps destroy replay-mb-${BUILDKITE_BUILD_NUMBER} -y
}

yarn install

# This will ensure that the cleanup function is called when the script exits, regardless of the exit status.
trap cleanup EXIT

# start the fly app
fly app create --name replay-mb-${BUILDKITE_BUILD_NUMBER} -o replay
fly deploy -a replay-mb-${BUILDKITE_BUILD_NUMBER} -c fly.toml --vm-size shared-cpu-4x --ha=false

# run the tests
CYPRESS_REPLAYIO_ENABLED=1 E2E_HOST=https://replay-mb-${BUILDKITE_BUILD_NUMBER}.fly.dev QA_DB_ENABLED=false yarn test-cypress-run --e2e --browser replay-chromium
