import { ClassType, GenericClassDecorator, paramTypeIsClass } from '../../src/common'

const StubDecorator: GenericClassDecorator<ClassType<object>> = _ => { }

class Dependency {}
class OtherDependency {
  constructor(_x: number) {}
}
class DerivedDependency extends OtherDependency {}
@StubDecorator
class TestClass {
  constructor(
    _a: number,
    _b: boolean,
    _c: string,
    _d: Symbol,
    _e: Object,
    _f: Array<number>,
    _g: Dependency,
    _h: Function,
    _i: (x: number) => number,
    _j: { x: number, y: string },
    _k: OtherDependency,
    _l: DerivedDependency) {}
}

const expected = [
  false,
  false,
  false,
  false,
  false,
  true,
  true,
  false,
  false,
  false,
  true,
  true
]

describe('paramTypeIsClass', () => {
  it('should return correct result', () => {
    const paramTypes = Reflect.getMetadata('design:paramtypes', TestClass)
    for (let index = 0; index < paramTypes.length; index++) {
      expect(paramTypeIsClass(paramTypes[index])).toBe(expected[index], paramTypes[index].name)
    }
  })
})
