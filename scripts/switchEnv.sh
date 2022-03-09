#!/bin/bash

if test -f .env.$1; then
  cp .env.$1 .env
  echo "Environment changed to .env.$1"
else
  echo "Environment .env.$1 doesn't exist."
  exit 2
fi