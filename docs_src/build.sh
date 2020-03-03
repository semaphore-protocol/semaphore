#!/bin/bash

cd "$(dirname "$0")"
mkdir -p ../docs

mdbook build . --dest-dir ../docs/ 
