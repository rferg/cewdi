import { Provider } from './provider'
import { InjectionToken } from './injection-token'
import { ExplicitProvider } from './explicit-provider'
import { ClassTypeToken } from './class-type-token'
import { ClassType } from '../common'
import { Lifetime } from './lifetime'

/**
 * Represents an instance of a provider
 * in an Injector's dependency graph
 */
export class ProviderVertex {
  /**
   * The underlying provider
   */
  provider: Provider
  /**
   * The value instance
   */
  instance: any
  /**
   * The injection token
   */
  get token(): InjectionToken {
    return this.provider instanceof ExplicitProvider
      ? this.provider.token
      : new ClassTypeToken(this.provider as ClassType<object>, this.provider.name)
  }
  /**
   * The provider's lifetime
   */
  get lifetime(): Lifetime {
    return this.provider instanceof ExplicitProvider
      ? this.provider.lifetime
      : Lifetime.Singleton
  }
  /**
   * Create a ProviderVertex instance
   * @param provider the underlying provider
   */
  constructor(provider: Provider) {
    this.provider = provider
  }
}
