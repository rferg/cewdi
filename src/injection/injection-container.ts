import { Injector } from './injector'
import { Provider } from './provider'
import { InjectionToken } from './injection-token'

type InjectorFactory = (providers: Provider[]) => Injector
/**
 * Dependency injection container
 */
export class InjectionContainer {
  private readonly injectorFactory: InjectorFactory
  private readonly injector: Injector

  /**
   * Creates new instance InjectionContainer instance
   * @param injector the dependency injector
   */
  protected constructor(providers: Provider[], injectorFactory: InjectorFactory) {
    this.injectorFactory = injectorFactory
    this.injector = this.injectorFactory(providers)
  }

  /**
   * Create a new InjectionContainer instance
   * @param providers array of token-to-value exchange definitions
   */
  static create(providers: Provider[]): InjectionContainer {
    return new InjectionContainer(providers, (providers: Provider[]) => new Injector(providers || []))
  }

  /**
   * Exchanges the given token with a value
   * @param injectionToken the token to exchange
   */
  resolve<T>(injectionToken: InjectionToken<T>): T {
    return this.injector.resolve(injectionToken)
  }

  /**
   * Creates a new InjectionContainer that has
   * access to all of the providers of this container,
   * but also some additional providers
   * @param providers the additional providers for the child container
   */
  createChildContainer(providers: Provider[]): InjectionContainer {
    return new InjectionContainer(providers, (childProviders: Provider[]) => {
      const childInjector = this.injectorFactory(childProviders)
      childInjector.addVertices(this.injector.vertices)
      return childInjector
    })
  }
}
