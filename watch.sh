#!/bin/bash

inotifywait -m -r -e modify,create,delete,move ./src |
while read -r event file; do
  echo "File '$file' in './src' triggered event: $event"
  ./build.sh
done
