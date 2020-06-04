import React from 'react'
import renderer from 'react-test-renderer'
import Visibility from './Visibility'

describe('Visibility', () => {
  it('Visibility.toString', () => {
    expect((new Visibility("3")).toString()).toBe("발행")
    expect((new Visibility("2")).toString()).toBe("발행")
    expect((new Visibility("1")).toString()).toBe("저장")
    expect((new Visibility("0")).toString()).toBe("저장")
  })  
})
