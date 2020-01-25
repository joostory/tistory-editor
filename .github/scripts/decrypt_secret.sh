#!/bin/sh

openssl aes-256-cbc -K $BUILD_KEY -iv $BUILD_IV -a \
  -in oauthInfo.json.ssl -out oauthInfo.json -d
