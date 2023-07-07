set -eox pipefail

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Init test run id"
export RECORD_REPLAY_METADATA_TEST_RUN_ID=$(npx uuid)

echo "Yarn install"
npx -y yarn install --frozen-lockfile --prefer-offline

if which java > /dev/null; then
    echo "Java already installed"
else
    echo "Install Java"
    
    curl -O https://download.java.net/java/GA/jdk20.0.1/b4887098932d415489976708ad6d1a4b/9/GPL/openjdk-20.0.1_linux-x64_bin.tar.gz
    tar xf openjdk-20.0.1_linux-x64_bin.tar.gz
    export JAVA_HOME=$(pwd)/jdk-20.01/bin
fi

if which clojure > /dev/null; then
    echo "Clojure already installed"
else
    echo "Install Clojure"

    curl -O https://download.clojure.org/install/linux-install-1.11.1.1262.sh
    bash ./linux-install-1.11.1.1262.sh
fi

echo "Build uberjar with ./bin/build.sh"
$SCRIPT_DIR/../bin/build.sh

# echo "Running cypress tests"
CYPRESS_REPLAYIO_ENABLED=1 yarn test-cypress-run --browser replay-chromium

