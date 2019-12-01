#!/bin/sh

openssl aes-256-cbc -k "$BUILD_PASSPHRASE" \
  -in $HOME/oauth2info.json.enc -out $HOME/oauth2info.json -d
