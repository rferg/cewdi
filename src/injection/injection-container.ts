import { Injector } from './injector'
import { Provider } from './provider'
import { InjectionToken } from './injection-token'

/**
 * Dependency injection container
 */
export class InjectionContainer {
  private readonly injector: Injector

  /**
   * Creates new instance InjectionContainer instance
   * @param injector the dependency injector
   */
  protected constructor(injector: Injector) {
    this.injector = injector
  }

  /**
   * Create a new InjectionContainer instance
   * @param providers array of token-to-value exchange definitions
   */
  static create(providers: Provider[]): InjectionContainer {
    return new InjectionContainer(new Injector(providers || []))
  }

  /**
   * Exchanges the given token with a value
   * @param injectionToken the token to exchange
   */
  resolve<T>(injectionToken: InjectionToken<T>): T {
    return this.injector.resolve(injectionToken)
  }
}
