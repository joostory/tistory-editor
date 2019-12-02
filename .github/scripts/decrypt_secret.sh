#!/bin/sh

openssl aes-256-cbc -K $BUILD_KEY -iv $BUILD_IV -a \
  -in oauth2info.json.ssl -out oauth2info.json -d
