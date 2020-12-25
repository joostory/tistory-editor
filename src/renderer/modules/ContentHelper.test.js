import { makeUrlBase, unixtimstampToDate, timestampsToDate } from './ContentHelper'
import dayjs from 'dayjs'

describe("makeUrlBase", () => {
  it('// => https', () => {
    const target = "<img src='//test.com/image.png' />"
    const expected = "<img src='https://test.com/image.png' />"
  
    expect(makeUrlBase(target)).toBe(expected)
  })  
})

describe("unixtimestampToDate", () => {
  it('convert int', () => {
    const target = 1526033772000
    const expected = '2018-05-11'
    expect(unixtimstampToDate(target)).toBe(expected)
  })
  
  it('convert string', () => {
    const target = '1526033772000'
    const expected = '2018-05-11'
    expect(unixtimstampToDate(target)).toBe(expected)
  })
  
  it('convert empty', () => {
    const expected = dayjs(new Date()).format('YYYY-MM-DD')
    expect(unixtimstampToDate()).toBe(expected)
  })  
})


describe("timestampsToDate", () => {
  it('2018-12-04T23:39:17Z', () => {
    expect(timestampsToDate('2018-12-04T23:39:17Z')).toBe('2018-12-05')
  })

  it('2018-12-04T01:46:57Z', () => {
    expect(timestampsToDate('2018-12-04T01:46:57Z')).toBe('2018-12-04')
  })
})
