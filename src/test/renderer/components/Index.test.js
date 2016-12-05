import React from 'react'
import renderer from 'react-test-renderer'
import Index from '../../../renderer/components/Index'

test('Index component', () => {

	let blogs = [
		{
			"url":"http://oauth.tistory.com",
			"secondaryUrl":"http://",
			"nickname":"Tistory API",
			"title":"나만의 앱, Tistory OAuth API 로 만들어보세요!",
			"description":"",
			"default":"Y",
			"blogIconUrl":"http://i1.daumcdn.net/cfs.tistory/blog/79/795307/index.gif",
			"faviconUrl":"http://i1.daumcdn.net/cfs.tistory/blog/79/795307/index.ico",
			"profileThumbnailImageUrl":"http://cfile1.uf.tistory.com/R106x0/1851DB584DAF942950AF29",
			"profileImageUrl":"http://cfile1.uf.tistory.com/R106x0/1851DB584DAF942950AF29",
			"statistics": {
			  "post":"3",
			  "comment":"0",
			  "trackback":"0",
			  "guestbook":"0",
			  "invitation":"0"
			}
		}
	]

	let user = {
		loginId: "test@domain.com",
		name: "TEST",
		created: "1419296942",
		image: "http://cfile21.uf.tistory.com/image/2524074E582E9088392DC2"
	}

	const component = renderer.create(
		<Index user={user} blogs={blogs} onSelect={() => {}} />
	)

	let tree = component.toJSON()
	expect(tree).toMatchSnapshot()
	expect(tree.children[0].children[1].children[0]).toBe(user.name)
	expect(tree.children[0].children[2].children[1]).toBe(user.loginId)

	expect(tree.children[1].children[0].children[1].children[0]).toBe(blogs[0].title)
	expect(tree.children[1].children[0].children[2].children[0]).toBe(blogs[0].description)
	expect(tree.children[1].children[0].children[3].children[0]).toBe(blogs[0].url)
})
