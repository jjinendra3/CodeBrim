#!/usr/bin/env bash
# Prepares the Docker images used to run code (see routes/helper/codeExecuter.ts).
# Run once after cloning and on every deploy; images already present are not
# downloaded again, so repeat runs take seconds. First run downloads ~6 GB.
#
# Usage (from Backend/):
#   bash dock/prepare-images.sh
#   DOCKER_SUDO=true bash dock/prepare-images.sh   # if docker needs sudo
set -euo pipefail
cd "$(dirname "$0")"

docker_cmd() {
  if [ "${DOCKER_SUDO:-}" = "true" ]; then sudo docker "$@"; else docker "$@"; fi
}

# Go gets its own image with the standard library precompiled.
docker_cmd build -q -t codebrim-go go >/dev/null
echo "built codebrim-go"

for img in gcc:latest python:3 node:20 eclipse-temurin:11-jdk; do
  if docker_cmd image inspect "$img" >/dev/null 2>&1; then
    echo "present $img"
  else
    echo "pulling $img ..."
    docker_cmd pull -q "$img" >/dev/null
  fi
done
