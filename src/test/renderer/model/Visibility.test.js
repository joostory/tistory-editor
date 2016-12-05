import React from 'react'
import renderer from 'react-test-renderer'
import Visibility from '../../../renderer/model/Visibility'

test('Visibility', () => {
  expect((new Visibility("3")).toString()).toBe("발행")
  expect((new Visibility("2")).toString()).toBe("발행")
  expect((new Visibility("1")).toString()).toBe("저장")
  expect((new Visibility("0")).toString()).toBe("저장")
})
