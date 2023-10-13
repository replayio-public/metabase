#!/bin/bash
set -euox pipefail

cleanup() {
    # destroy the fly app
    fly apps destroy replay-mb-${BUILDKITE_BUILD_NUMBER} -y
}

yarn install

# TODO(dmiller): download Replay browser
# set RECORD_REPLAY_DIRECTORY to current working directory + .replay
export RECORD_REPLAY_DIRECTORY=`pwd`/.replay

# create the .replay directory
mkdir -p $RECORD_REPLAY_DIRECTORY/runtimes

# download the Replay browser to RECORD_REPLAY_DIRECTORY/runtimes/Replay-Chromium.app/
curl -L https://static.replay.io/downloads/macOS-chromium-20230916-e7589a401ac1-4d0a9f5b9de2.dmg -o $RECORD_REPLAY_DIRECTORY/runtimes/Replay-Chromium.app.dmg
hdiutil attach $RECORD_REPLAY_DIRECTORY/runtimes/Replay-Chromium.app.dmg
cp -R /Volumes/Replay-Chromium/Replay-Chromium.app $RECORD_REPLAY_DIRECTORY/runtimes/Replay-Chromium.app
hdiutil detach /Volumes/Replay-Chromium

# This will ensure that the cleanup function is called when the script exits, regardless of the exit status.
trap cleanup EXIT

# start the fly app
fly app create --name replay-mb-${BUILDKITE_BUILD_NUMBER} -o replay
fly deploy -a replay-mb-${BUILDKITE_BUILD_NUMBER} -c fly.toml --vm-size shared-cpu-4x --ha=false

# run the tests
CYPRESS_REPLAYIO_ENABLED=1 E2E_HOST=https://replay-mb-${BUILDKITE_BUILD_NUMBER}.fly.dev QA_DB_ENABLED=false yarn test-cypress-run --e2e --browser replay-chromium
