#!/usr/bin/env bash

set -o errexit

[[ $1 =~ (-h|--help) ]] && {
  echo "usage: ${0##*/} <circom params>"
  echo "e.g.:  ${0##*/} circuits/hello.circom --r1cs --wasm --sym --c --output compiled/"
  exit 1
}

path_this=$( cd $(dirname "$0"); pwd -L )
if [ -L "$0" ]; then
  path_this=$(dirname $(readlink ${path_this}/$(basename "$0"))) # path relatively to the symlink file
  [[ "$path_this" != /* ]] && path_this=$(cd $(dirname "$0")/${path_this}; pwd -L)
fi

test -t 1 && USE_TTY="-t" | USE_TTY=""

docker run -i ${USE_TTY} --rm \
  -v "${path_this}/..":/data \
  -v /etc/passwd:/etc/passwd:ro \
  -v /etc/group:/etc/group:ro \
  --user $(id -u) \
  aspiers/circom circom $@
