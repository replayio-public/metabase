set -eox pipefail

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Init test run id"
export RECORD_REPLAY_METADATA_TEST_RUN_ID=$(npx uuid)

echo "Install yarn"
sudo npm i -g yarn

echo "Yarn install"
yarn install --frozen-lockfile --prefer-offline

echo "Install Java"
which java > /dev/null || (curl -O https://download.java.net/java/GA/jdk20.0.1/b4887098932d415489976708ad6d1a4b/9/GPL/openjdk-20.0.1_linux-x64_bin.tar.gz && tar xf openjdk-20.0.1_linux-x64_bin.tar.gz)

echo "Install Clojure"
which bash > /dev/null || (curl -O https://download.clojure.org/install/linux-install-1.11.1.1262.sh && sudo bash ./linux-install-1.11.1.1262.sh)

echo "Build uberjar with ./bin/build.sh"
$SCRIPT_DIR/../bin/build.sh

# echo "Running cypress tests"
CYPRESS_REPLAYIO_ENABLED=1 yarn test-cypress-run --browser replay-chromium

