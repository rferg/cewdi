import { TestClass } from '../src/test'

describe('TestClass', () => {
  it('should create', () => {
    expect(new TestClass()).toBeTruthy()
  })

  describe('#add', () => {
    it('should return sum of numbers', () => {
      const x = 8
      const y = 9
      const expected = x + y

      const actual = new TestClass().add(x, y)

      expect(actual).toBe(expected)
    })
  })
})
