import { makeThumbnail } from './ThumbnailHelper'

describe("ThumbnailHelper", () => {
  test("makeThumbnail", () => {
    expect(makeThumbnail('S200x200', null)).toBe(null)
    expect(makeThumbnail('S200x200', "https://occ-0-3997-1009.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABYMBwMJ0jCcHjZfookNoM-LHUXLHsoYjzt9gcw_E7RdUVeLkg-3FHJod6IgwGuy3PymWOKBqYKWJxfBJt2UrWttf3emc.jpg?r=e24"))
      .toBe("https://img1.daumcdn.net/thumb/S200x200/?scode=mtistory2&fname=https%3A%2F%2Focc-0-3997-1009.1.nflxso.net%2Fdnm%2Fapi%2Fv6%2FE8vDc_W8CLv7-yMQu8KMEC7Rrr8%2FAAAABYMBwMJ0jCcHjZfookNoM-LHUXLHsoYjzt9gcw_E7RdUVeLkg-3FHJod6IgwGuy3PymWOKBqYKWJxfBJt2UrWttf3emc.jpg%3Fr%3De24")
    expect(makeThumbnail('S200x200', "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F99663C455C7A92530A"))
      .toBe("https://img1.daumcdn.net/thumb/S200x200/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F99663C455C7A92530A")
  })
})
