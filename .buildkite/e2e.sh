set -eox pipefail

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Init test run id"
export RECORD_REPLAY_METADATA_TEST_RUN_ID=$(npx uuid)

if [ -e "${SCRIPT_DIR}/../node_modules" ]; then
    echo "NPM modules already installed"
else
    exit
    echo "Yarn install"
    npx -y yarn install --frozen-lockfile --prefer-offline
fi

if which java > /dev/null; then
    echo "Java already installed"
else
    echo "Install Java"
    
    curl -O https://download.java.net/java/GA/jdk20.0.1/b4887098932d415489976708ad6d1a4b/9/GPL/openjdk-20.0.1_linux-x64_bin.tar.gz
    tar xf openjdk-20.0.1_linux-x64_bin.tar.gz
    JAVA_HOME="$(pwd)/jdk-20.0.1"
fi

if which clojure > /dev/null; then
    echo "Clojure already installed"
else
    echo "Install Clojure"

    curl -O https://download.clojure.org/install/linux-install-1.11.1.1262.sh
    bash ./linux-install-1.11.1.1262.sh
fi

if [ -e "${SCRIPT_DIR}/../target/uberjar/metabase.jar" ]; then
    echo "uberjar already built"
else
    echo "Build uberjar with ./bin/build.sh"
    JAVA_HOME=$JAVA_HOME PATH=$PATH:$JAVA_HOME/bin $SCRIPT_DIR/../bin/build.sh || (sleep 300 && exit 1)
fi

Xvfb :1 &

# echo "Running cypress tests"
JAVA_HOME=$JAVA_HOME PATH=$PATH:$JAVA_HOME/bin CYPRESS_REPLAYIO_ENABLED=1 yarn test-cypress-run --browser replay-chromium

