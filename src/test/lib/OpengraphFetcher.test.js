import React from 'react'
import renderer from 'react-test-renderer'
import OpengraphFetcher from '../../lib/OpengraphFetcher'

it('Opengraph Fetch', done => {
	let expected = {
		description: "안녕하세요, TISTORY입니다. 지난 2월 2일부터 시범운영한 로그인 보안 기능을 정식 오픈합니다. 현재까지 3천 여개의 계정에서 사용 중이며 등록된 기기는 7천 여개에 달합니다. 많은 분들의 사용으로 안정성을 확인하였으므로 이제 모든 계정에 로그인 보안 기능을 활성화하려고 합니다 로그인 보안 바로가기 Q&A 정식 오픈으로 무엇이 달라지나요? 모든 계정에 로그인 보안이 기본적으로 활성화됩니다. 시범운영 기간 동안에..",
		host: "notice.tistory.com",
		mediaUrl: "",
		image: "http://cfile8.uf.tistory.com/image/273C1E4B58EDB60D0C8BEA",
		title: "당신의 블로그는 안전한가요? - 로그인 보안 기능 정식 오픈",
		type: "article",
		url: "http://notice.tistory.com/2384"
	}

	OpengraphFetcher.fetch("http://notice.tistory.com/2384", opengraph => {
		expect(opengraph.title).toBe(expected.title)
		expect(opengraph.description).toBe(expected.description)
		expect(opengraph.type).toBe(expected.type)
		expect(opengraph.url).toBe(expected.url)
		expect(opengraph.image).toBe(expected.image)
		expect(opengraph.mediaUrl).toBe(undefined)
		done()
	})
})

it('None Image', done => {
	OpengraphFetcher.fetch("https://joostory.github.io/og.html", opengraph => {
		expect(opengraph.image).toBe(undefined)
		done()
	})
})


it('Youtube', done => {

	let expected = {
		description: "물가 비싸다고 세계적으로 유명한 런던. 슈퍼에서 장을 보면 물가가 어떨까? _______________________________________________________________ ✮구독!!!: https://www.youtube.com/gabiekook ✮인스타: htt...",
		host: "www.youtube.com",
		mediaUrl: "https://www.youtube.com/embed/8szi8_383JI",
		image: "https://i.ytimg.com/vi/8szi8_383JI/maxresdefault.jpg",
		title: "비싼 영국의 진짜 물가는??",
		type: "video",
		url: "https://www.youtube.com/watch?v=8szi8_383JI"
	}

	OpengraphFetcher.fetch("https://youtu.be/8szi8_383JI", opengraph => {
		expect(opengraph.title).toBe(expected.title)
		expect(opengraph.description).toBe(expected.description)
		expect(opengraph.image).toBe(expected.image)
		expect(opengraph.type).toBe(expected.type)
		expect(opengraph.mediaUrl).toBe(expected.mediaUrl)
		done()
	})
})
