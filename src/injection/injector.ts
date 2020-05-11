import { Provider } from './provider'
import { InjectionToken } from './injection-token'

class ProviderNode {
  value: Provider | null
  children: ProviderNode[]

  constructor(value: Provider | null) {
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
  private readonly tree: ProviderNode

  /**
   * Create an Injector instance
   * @param providers the token-value exchange definitions
   */
  constructor(providers: Provider[]) {
    this.tree = new ProviderNode(null)
    this.createDependencyTree(this.tree, providers)
  }

  /**
   * Gets the value represented by the given token
   * @param token the token to exchange
   */
  resolve<T>(_: InjectionToken<T>): T {
    // TODO
    throw new Error('Not implemented')
  }

  private createDependencyTree(_: ProviderNode, __: Provider[]): ProviderNode {
    // TODO
    throw new Error('Not implemented')
  }

}
