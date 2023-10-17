{
  description = "Barebones flake to provide an environment for e2e tests";

  # Flake inputs
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs?ref=nixos-unstable";
  };

  # Flake outputs
  outputs = { self, nixpkgs }:
    let
      # Systems supported
      allSystems = [
        "x86_64-linux" # 64-bit Intel/AMD Linux
        "aarch64-linux" # 64-bit ARM Linux
        "x86_64-darwin" # 64-bit Intel macOS
        "aarch64-darwin" # 64-bit ARM macOS
      ];

      # Helper to provide system-specific attributes
      forAllSystems = f: nixpkgs.lib.genAttrs allSystems (system: f {
        pkgs = import nixpkgs { inherit system; };
      });
    in
    {
      # Development environment output
      devShells = forAllSystems ({ pkgs }: {
        default = pkgs.mkShell {
          # The Nix packages provided in the environment
          packages = with pkgs; [
            yarn
            nodejs_18
            flyctl
            cypress
          ];
          shellHook = ''
            export BUILDKITE_BRANCH=$BUILDKITE_BRANCH
            export BUILDKITE_COMMIT=$BUILDKITE_COMMIT
            export BUILDKITE_BUILD_NUMBER=$BUILDKITE_BUILD_NUMBER
            export BUILDKITE_BUILD_ID=$BUILDKITE_BUILD_ID
            export BUILDKITE_MESSAGE=$BUILDKITE_MESSAGE
            export BUILDKITE_BUILD_URL=$BUILDKITE_BUILD_URL
            export BUILDKITE_TRIGGERED_FROM_BUILD_ID=$BUILDKITE_TRIGGERED_FROM_BUILD_ID
            export FLY_ACCESS_TOKEN=$FLY_ACCESS_TOKEN
            export RECORD_REPLAY_API_KEY=$RECORD_REPLAY_API_KEY
          '';
        };
      });
    };
}
