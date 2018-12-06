import { makeUrlBase, unixtimstampToDate, timestampsToDate } from './ContentHelper'
import dateformat from 'dateformat'

describe("makeUrlBase", () => {
  test('// => https', () => {
    const target = "<img src='//test.com/image.png' />"
    const expected = "<img src='https://test.com/image.png' />"
  
    expect(makeUrlBase(target)).toBe(expected)
  })  
})

describe("unixtimestampToDate", () => {
  test('convert int', () => {
    const target = 1526033772000
    const expected = '2018-05-11'
    expect(unixtimstampToDate(target)).toBe(expected)
  })
  
  test('convert string', () => {
    const target = '1526033772000'
    const expected = '2018-05-11'
    expect(unixtimstampToDate(target)).toBe(expected)
  })
  
  test('convert empty', () => {
    const expected = dateformat(new Date(), 'yyyy-mm-dd')
    expect(unixtimstampToDate()).toBe(expected)
  })  
})


describe("timestampsToDate", () => {
  test('2018-12-04T23:39:17Z', () => {
    expect(timestampsToDate('2018-12-04T23:39:17Z')).toBe('2018-12-05')
  })

  test('2018-12-04T01:46:57Z', () => {
    expect(timestampsToDate('2018-12-04T01:46:57Z')).toBe('2018-12-04')
  })
})
