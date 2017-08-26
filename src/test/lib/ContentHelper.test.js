import * as ContentHelper from '../../lib/ContentHelper'

test('makeUrlBase', () => {
	const target = "<img src='//test.com/image.png' />"
	const expected = "<img src='https://test.com/image.png' />"

	expect(ContentHelper.makeUrlBase(target)).toBe(expected)
})
