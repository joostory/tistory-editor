#!/bin/sh

openssl aes-256-cbc -k "$BUILD_PASSPHRASE" \
  -in $HOME/oauth2info.json.ssl -out $HOME/oauth2info.json -d
