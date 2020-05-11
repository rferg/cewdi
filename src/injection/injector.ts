import { Provider } from '../registration/provider'
import { InjectionToken } from './injection-token'

class ProviderNode {
  value: Provider
  children: ProviderNode[]

  constructor(value: Provider) {
    this.value = value
    this.children = []
  }

  addChild(value: Provider) {
    this.children.push(new ProviderNode(value))
  }
}

/**
 * Resolves injection tokens with values
 */
export class Injector {
  private tree: ProviderNode

  /**
   * Create an Injector instance
   * @param providers the token-value exchange definitions 
   */
  constructor(providers: Provider[]) {
    this.tree = this.createDependencyTree(providers)
  }

  /**
   * Gets the value represented by the given token
   * @param token the token to exchange
   */
  resolve<T>(token: InjectionToken<T>): T {
    // TODO
    throw new Error('Not implemented')
  }

  private createDependencyTree(providers: Provider[]): ProviderNode {
    // TODO
    throw new Error('Not implemented')
  }

}
