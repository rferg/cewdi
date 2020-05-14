import { ClassTypeToken, Inject, Injectable, InjectionToken, parameterInjectionTokensMetadataKey } from '../../src/injection'

class DependencyClass {}
class OtherDependencyClass {}
@Injectable()
class TestClass {
  prop1: OtherDependencyClass
  prop2: DependencyClass
  prop3: number

  constructor(_prop1: OtherDependencyClass, _prop2: DependencyClass, _prop3: number) {
    this.prop1 = _prop1
    this.prop2 = _prop2
    this.prop3 = _prop3
  }
}

describe('Injectable', () => {
  it('should add injection tokens to metadata for all and only class dependencies', () => {
    const target = TestClass

    Injectable()(target)

    // tslint:disable-next-line: no-any
    const metadata: ClassTypeToken<any>[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target)
    expect(metadata.length).toBe(TestClass.length)
    expect(metadata[0].classType).toEqual(OtherDependencyClass)
    expect(metadata[1].classType).toEqual(DependencyClass)
    expect(metadata[2]).toBeFalsy()
  })

  it('should not overwrite @Inject parameter injection tokens', () => {
    const paramToken = new InjectionToken<string>('not overwritten')
    @Injectable()
    class TestClass2 {
      // tslint:disable-next-line: no-empty
      constructor(@Inject(paramToken) _dep: OtherDependencyClass, _dep1: DependencyClass) { }
    }

    const target = TestClass2

    Injectable()(target)

    const metadata: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target)
    expect(metadata.length).toEqual(target.length)
    expect(metadata[0]).toEqual(paramToken)
    expect((metadata[1] as ClassTypeToken<DependencyClass>).classType).toEqual(DependencyClass)
  })

  it('should leave empty metadata array for class with no parameters', () => {
    @Injectable()
    class TestClass3 {}

    const target = TestClass3

    Injectable()(target)

    const metadata: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target)
    expect(metadata.length).toBe(0)
  })
})
