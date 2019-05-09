#!/bin/bash -xe

while true; do
  code=`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/element_index/$1`
  if [ $code -eq 200 ]; then
    echo "found commitment, continuing"
    break
  else
    echo "didn't find commitment, waiting"
    sleep 1
  fi
done
