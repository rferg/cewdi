import { ClassTypeToken, ExplicitProvider, InjectionToken, Lifetime } from '../../src/injection'
import { ProviderVertex } from '../../src/injection/provider-vertex'

describe('ProviderVertex', () => {
  describe('constructor', () => {
    it('should assign provider', () => {
      const provider = new ExplicitProvider(new InjectionToken('test'), 45)

      const vertex = new ProviderVertex(provider)

      expect(vertex.provider).toBe(provider)
    })
  })

  describe('getter:token', () => {
    it('should return ExplicitProvider token', () => {
      const token = new InjectionToken('test')
      const provider = new ExplicitProvider(token, 45)

      const vertex = new ProviderVertex(provider)

      expect(vertex.token).toBe(token)
    })

    it('should return token with same id for ClassTypeProvider', () => {
      const classType = class TestClass {}
      const token = new ClassTypeToken(classType)
      const provider = classType

      const vertex = new ProviderVertex(provider)

      expect(vertex.token.id).toBe(token.id)
    })
  })

  describe('getter:lifetime', () => {
    it('should return provider lifetime for ExplicitProvider', () => {
      const provider = new ExplicitProvider(
        new InjectionToken('test'),
        45,
        { lifetime: Lifetime.Transient }
      )

      const vertex = new ProviderVertex(provider)

      expect(vertex.lifetime).toBe(provider.lifetime)
    })

    it('should return Singleton for ClassTypeProvider', () => {
      const provider = class TestClass {}

      const vertex = new ProviderVertex(provider)

      expect(vertex.lifetime).toBe(Lifetime.Singleton)
    })
  })
})
