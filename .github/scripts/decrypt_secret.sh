#!/bin/sh

openssl aes-256-cbc -k "$BUILD_PASSPHRASE" -a \
  -in oauth2info.json.ssl -out oauth2info.json -d
