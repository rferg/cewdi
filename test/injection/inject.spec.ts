import { Inject, InjectionToken, parameterInjectionTokensMetadataKey } from '../../src/injection'

class TestClass {
  prop1: number
  prop2: string
  prop3: boolean

  constructor(_prop1: number, _prop2: string, _prop3: boolean) {
    this.prop1 = _prop1
    this.prop2 = _prop2
    this.prop3 = _prop3
  }
}
describe('Inject', () => {
  it('should add token to new target metadata', () => {
    const token = new InjectionToken('test')
    const target = TestClass as Object
    const inject = Inject(token)
    const parameterIndex = 0

    inject(target, '_prop1', parameterIndex)

    const metadata: InjectionToken[] = Reflect.getOwnMetadata(parameterInjectionTokensMetadataKey, target)

    expect(metadata).toBeDefined()
    expect(metadata.length).toBe(TestClass.length)
    expect(metadata[parameterIndex]).toBe(token)
  })

  it('should add multiple tokens to metadata', () => {
    const target = TestClass
    const tokens = []
    for (let index = 0; index < target.length; index++) {
      const token = new InjectionToken(`${index}_test`)
      tokens.push(token)
      const inject = Inject(token)

      inject(target, '', index)
    }

    const metadata: InjectionToken[] = Reflect.getOwnMetadata(parameterInjectionTokensMetadataKey, target)

    expect(metadata).toEqual(tokens)
  })
})
