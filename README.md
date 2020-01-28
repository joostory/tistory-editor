# Editor for Tumblr ![Download Count][download_count] ![Build Result][build_result]

[download_count]: https://img.shields.io/github/downloads/joostory/tumblr-editor/total.svg
[build_result]: https://github.com/joostory/tumblr-editor/workflows/Build/badge.svg

**Editor for Tumblr** 는 [Tumblr의 API](https://www.tumblr.com/docs/en/api/v2)를 사용하여 텀블러에 글을 작성하고 작성한 글을 관리하는 목적으로 만들고 있습니다.

## Run (개발용)

```
$ npm install

# react build (development)
$ npm run watch

# electron start
$ npm run app

# react build and run app (development)
# npm start
```

## 배포용 앱 생성

```
$ npm install

# react build (production)
$ npm run build

# 현재 OS 앱 생성
$ npm run dist

# 모든 OS 앱 생성
$ npm run dist -- -wml
```
