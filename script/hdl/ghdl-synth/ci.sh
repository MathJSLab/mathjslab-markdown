#!/usr/bin/env bash
# Linux CI entry point. Candidate outputs never replace packaged browser assets.
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_dir=$(cd -- "$script_dir/../../.." && pwd)
cd "$repo_dir"
evidence="$repo_dir/.hdl-research/ghdl-ci"
# Refuse reuse: a reconstruction must not silently consume an earlier build cache.
if [[ -e "$evidence" ]]; then
  printf 'Refusing existing evidence directory: %s\n' "$evidence" >&2
  exit 1
fi
mkdir -p "$evidence"
exec > >(tee "$evidence/build.log") 2>&1
trap 'status=$?; printf "%s\n" "$status" > "$evidence/exit-code.txt"; df -h > "$evidence/disk-final.txt"; if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then printf "GHDL candidate build exit code: %s. See uploaded evidence; this is not browser validation or publication approval.\n" "$status" >> "$GITHUB_STEP_SUMMARY"; fi' EXIT

git rev-parse HEAD > "$evidence/commit.txt"
uname -a > "$evidence/host.txt"
node --version > "$evidence/node-version.txt"
python3 -m unittest discover -s test/hdl-ci -p '*_test.py'
node --test test/hdl-ci/*.test.mjs
docker version > "$evidence/docker-version.txt"
df -h > "$evidence/disk-initial.txt"
image=mathjslab-ghdl-ci:local
docker build --tag "$image" "$script_dir"
# Both builds use this exact image. Record its identity and every installed package.
docker image inspect "$image" > "$evidence/container-image.json"
docker run --rm "$image" dpkg-query -W > "$evidence/container-packages.txt"
sha256sum "$script_dir/Dockerfile" "$script_dir/build-in-container.sh" "$script_dir/pack-libraries.py" > "$evidence/recipe-sha256.txt"

for attempt in 1 2; do
  cache="$repo_dir/.cache/ghdl-ci-$attempt"
  output="$evidence/build-$attempt"
  if [[ -e "$cache" ]]; then
    printf 'Refusing existing cache: %s\n' "$cache" >&2
    exit 1
  fi
  mkdir -p "$cache" "$output"
  printf 'Starting independent reconstruction %s at %s\n' "$attempt" "$(date -u +%FT%TZ)"
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    --env HOME=/cache/home \
    --env GHDL_WASM_JOBS="${GHDL_WASM_JOBS:-2}" \
    --volume "$repo_dir:/repo:ro" \
    --volume "$cache:/cache" \
    --volume "$output:/output" \
    --workdir /repo \
    "$image" bash /repo/script/hdl/ghdl-synth/build-in-container.sh
  GHDL_WASM_OUTPUT_DIR="$output" bash "$script_dir/test.sh" | tee "$output/smoke-tests.txt"
  df -h > "$evidence/disk-after-$attempt.txt"
done

# Byte identity is evidence, not an assumption. Preserve both outputs and fail
# on any difference, including unexpected catalog ordering or contents.
node "$script_dir/compare-builds.mjs" "$evidence/build-1" "$evidence/build-2" "$evidence/comparison.json"
