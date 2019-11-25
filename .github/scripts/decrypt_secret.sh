#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$BUILD_PASSPHRASE" \
--output $HOME/oauth2info.json oauth2info.json.gpg
