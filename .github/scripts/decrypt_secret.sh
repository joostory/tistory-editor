#!/bin/sh

openssl aes-256-cbc -pass $BUILD_PASS -iter 2 -a -d -in oauthInfo.json.ssl -out oauthInfo.json
