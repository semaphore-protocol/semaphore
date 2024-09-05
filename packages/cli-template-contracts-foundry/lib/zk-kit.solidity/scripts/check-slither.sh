#!/bin/sh
set -eu

CYAN="\033[36m"
RED="\033[31m"
RESET="\033[0m"

log() {
  printf "%b\n" "$1"
}

main() {
  if ! command -v slither >/dev/null; then
    log "${RED}error: slither is required but is not installed${RESET}.\nFollow instructions at ${CYAN}https://github.com/crytic/slither?tab=readme-ov-file#how-to-install${RESET} and try again."
    exit 1
  fi
}

main
