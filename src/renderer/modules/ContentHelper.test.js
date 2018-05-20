import * as ContentHelper from './ContentHelper'
import dateformat from 'dateformat'

test('makeUrlBase', () => {
	const target = "<img src='//test.com/image.png' />"
	const expected = "<img src='https://test.com/image.png' />"

	expect(ContentHelper.makeUrlBase(target)).toBe(expected)
})

test('timstampToDate', () => {
	const target = 1526033772000
	const expected = '2018-05-11'
	expect(ContentHelper.timstampToDate(target)).toBe(expected)
})

test('timstampToDate string', () => {
	const target = '1526033772000'
	const expected = '2018-05-11'
	expect(ContentHelper.timstampToDate(target)).toBe(expected)
})

test('timstampToDate default date', () => {
	const expected = dateformat(new Date(), 'yyyy-mm-dd')
	expect(ContentHelper.timstampToDate()).toBe(expected)
})
