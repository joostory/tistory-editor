# Editor ![Download Count][download_count] ![Build Result][build_result]

[download_count]: https://img.shields.io/github/downloads/joostory/tistory-editor/total.svg
[build_result]: https://github.com/joostory/tistory-editor/workflows/Build/badge.svg

**Editor**는 각 블로그의 API를 사용하여 블로그에 글을 작성하고 작성한 글을 관리하는 목적으로 만들고 있습니다.
- [Tistory의 API](https://tistory.github.io/document-tistory-apis)
- [Tumblr의 API](https://www.tumblr.com/docs/en/api/v2)

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
