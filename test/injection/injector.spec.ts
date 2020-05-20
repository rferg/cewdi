import { ClassTypeToken, Inject, Injectable, InjectionToken, Injector } from '../../src/injection'
import { Provider } from '../../src/injection/provider'
import { ExplicitProvider } from '../../src/injection/explicit-provider'
import { Lifetime } from '../../src/injection/lifetime'
import { ProviderVertex } from '../../src/injection/provider-vertex'

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

  describe('getter:vertices', () => {
    it('should return vertices for all initial providers', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const vertices = injector.vertices

      expect(providers.length).toBe(vertices.length)
      providers.forEach(provider => {
        expect(vertices.find(v => v.provider === provider)).toBeTruthy()
      })
    })

    it('should include added provider vertices', () => {
      const initialProviders: Provider[] = [
        Dependency
      ]
      const addedProviders: Provider[] = [
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(initialProviders)
      injector.addVertices(addedProviders.map(p => new ProviderVertex(p)))

      const vertices = injector.vertices

      const allProviders = [ ...initialProviders, ...addedProviders ]
      expect(allProviders.length).toBe(vertices.length)
      allProviders.forEach(provider => {
        expect(vertices.find(v => v.provider === provider)).toBeTruthy()
      })
    })
  })

  describe('addVertices', () => {
    it('should add vertices', () => {
      const injector = new Injector([])
      const vertices: ProviderVertex[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ].map(p => new ProviderVertex(p))

      injector.addVertices(vertices)

      expect(injector.vertices).toEqual(vertices)
    })

    it('should not duplicate vertices with same token', () => {
      const token = new InjectionToken('test')
      const providers = [
        new ExplicitProvider(token, 'test'),
        Dependency
      ]
      const injector = new Injector(providers)

      injector.addVertices(providers.map(p => new ProviderVertex(p)))

      expect(injector.vertices.length).toBe(providers.length)
      providers.forEach(provider => expect(injector.vertices.find(v => v.provider === provider)).toBeTruthy())
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

      expect(resolved).toBeInstanceOf(Dependency)
    })

    it('should resolve class with class and non-class dependencies', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)

      const resolved = injector.resolve(new ClassTypeToken(TestClass))

      expect(resolved).toBeInstanceOf(TestClass)
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

    it('should resolve if all providers are added', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector([])
      injector.addVertices(providers.map(p => new ProviderVertex(p)))

      const resolved = injector.resolve(new ClassTypeToken(TestClass))

      expect(resolved).toBeInstanceOf(TestClass)
    })

    it('should resolve if dependency provider added', () => {
      const providers: Provider[] = [
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)
      injector.addVertices([ new ProviderVertex(Dependency) ])

      const resolved = injector.resolve(new ClassTypeToken(TestClass))

      expect(resolved).toBeInstanceOf(TestClass)
    })

    it('should resolve unrelated added provider', () => {
      const providers: Provider[] = [
        Dependency,
        TestClass,
        new ExplicitProvider<string>(testClassInjectionToken, 'INJECTED_STRING')
      ]
      const injector = new Injector(providers)
      const addedProvider = new ExplicitProvider(new InjectionToken<number>('test'), 34)
      injector.addVertices([ new ProviderVertex(addedProvider) ])

      const resolved = injector.resolve(addedProvider.token)

      expect(resolved).toBe(addedProvider.value as number)
    })
  })
})
