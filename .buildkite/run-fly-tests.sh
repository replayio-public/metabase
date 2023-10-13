#!/bin/bash

# start the fly app
fly deploy -a replay-mb-${BUILDKITE_BUILD_NUMBER} -c fly.toml

# run the tests
E2E_HOST=https://replay-mb-${BUILDKITE_BUILD_NUMBER}-.dev QA_DB_ENABLED=false yarn test-cypress-run --e2e

# destroy the fly app
fly apps destroy -a replay-mb-${BUILDKITE_BUILD_NUMBER} -y
```