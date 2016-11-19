import React from 'react'
import renderer from 'react-test-renderer'
import Header from '../../renderer/components/Header'

test('Header component', () => {

	let info = {
		id: "test@email.com",
		blogs: [
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
	}

	const component = renderer.create(
		<Header info={info} currentBlog={info.blogs[0]} onSelect={() => {}} />
	)

	let tree = component.toJSON()
	expect(tree).toMatchSnapshot()
})
