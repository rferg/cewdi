import { ClassTypeToken, Inject, Injectable, InjectionToken, Injector } from '../../src/injection'
import { Provider } from '../../src/injection/provider'
import { ExplicitProvider } from '../../src/injection/explicit-provider'
import { Lifetime } from '../../src/injection/lifetime'

const testClassInjectionToken = new InjectionToken('testClassInjection')

@Injectable()
class Dependency {}

@Injectable()
class TestClass {
  constructor(
    _dep: Dependency,
    @Inject(testClassInjectionToken) _stringDep: string) {}
}

class NotDecorated {
  constructor(_dep: Dependency) { }
}

@Injectable()
class NotDecoratedAsDependency {
  constructor(_dep: NotDecorated) {}
}

describe('Injector', () => {

  describe('constructor', () => {
    it('should throw if non-decorated object is in providers', () => {
      const providers: Provider[] = [
        NotDecorated,
        Dependency,
        NotDecoratedAsDependency
      ]

      expect(() => new Injector(providers)).toThrowError(
        new RegExp(`^Missing injection metadata for ${NotDecorated.name}`)
      )
    })
  })

  describe('resolve', () => {
    it('should resolve class with no dependencies', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const resolved = injector.resolve(new ClassTypeToken(Dependency))
      expect(resolved instanceof Dependency).toBeTrue()
    })

    it('should resolve class with class and non-class dependencies', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const resolved = injector.resolve(new ClassTypeToken(TestClass))
      expect(resolved instanceof TestClass).toBeTrue()
    })

    it('should resolve non-class value', () => {
      const stringProvider = new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      const providers: Provider[] = [
        Dependency,
        TestClass,
        stringProvider
      ]
      const injector = new Injector(providers)

      const resolved = injector.resolve(testClassInjectionToken)
      expect(resolved).toBe(stringProvider.value)
    })

    it('should throw if missing class provider', () => {
      const providers: Provider[] = [
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      expect(() => injector.resolve(new ClassTypeToken(TestClass)))
        .toThrowError(`Injector does not have provider for ${Dependency.name}.`)
    })

    it('should throw if missing explicit provider', () => {
      const providers: Provider[] = [
        TestClass,
        Dependency
      ]
      const injector = new Injector(providers)

      expect(() => injector.resolve(new ClassTypeToken(TestClass)))
        .toThrowError(/^Injector does not have provider for/)
    })

    it('should throw if missing provider for requested object', () => {
      const providers: Provider[] = [
        Dependency,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      expect(() => injector.resolve(new ClassTypeToken(TestClass)))
        .toThrowError(`Injector does not have provider for ${TestClass.name}.`)
    })

    it('should provide the same instance twice if Singleton lifetime', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const firstInstance = injector.resolve(new ClassTypeToken(TestClass))
      const secondInstance = injector.resolve(new ClassTypeToken(TestClass))

      expect(firstInstance).toBe(secondInstance)
    })

    it('should not provide the same instance twice if Transient lifetime', () => {
      const providers: Provider[] = [
        Dependency,
        new ExplicitProvider<TestClass>(
          new ClassTypeToken(TestClass),
          TestClass,
          { lifetime: Lifetime.Transient }),
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const firstInstance = injector.resolve(new ClassTypeToken(TestClass))
      const secondInstance = injector.resolve(new ClassTypeToken(TestClass))

      expect(firstInstance).not.toBe(secondInstance)
    })

    it('should throw if Singleton with Transient dependency', () => {
      const providers: Provider[] = [
        new ExplicitProvider<Dependency>(
          new ClassTypeToken(Dependency),
          Dependency,
          { lifetime: Lifetime.Transient }),
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      expect(() => injector.resolve(new ClassTypeToken(TestClass)))
        .toThrowError(
          new RegExp(`^${TestClass.name} has a Singleton lifetime.+${Dependency.name}.+have Transient lifetimes`))
    })
  })
})
