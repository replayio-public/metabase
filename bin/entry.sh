#!/bin/bash

set -m # to make job control work
# ./tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
# ./tailscale up --authkey=${TAILSCALE_AUTHKEY} --accept-routes=true --accept-dns=true
# dockerd &
echo $SSH_PRIVATE_RSA_KEY_B64 | tr -d '\n' | base64 -d > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
/usr/local/bin/buildkite-agent start "$@"
