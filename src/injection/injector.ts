import { Provider } from './provider'
import { InjectionToken } from './injection-token'
import { ExplicitProvider } from './explicit-provider'
import { parameterInjectionTokensMetadataKey } from './parameter-injection-tokens-metadata-key'
import { ClassTypeToken } from './class-type-token'
import { ClassType } from '../common'

class ProviderEdge {
  dependentIndex: number
  dependencyIndex: number

  constructor(dependentIndex: number, dependencyIndex: number) {
    this.dependentIndex = dependentIndex
    this.dependencyIndex = dependencyIndex
  }
}

class ProviderVertex {
  provider: Provider
  // tslint:disable-next-line: no-any
  instance: any
  get token(): InjectionToken {
    return this.provider instanceof ExplicitProvider
      ? this.provider.value
      : new ClassTypeToken(this.provider as ClassType<object>, this.provider.name)
  }

  constructor(provider: Provider) {
    this.provider = provider
  }
}

class ProviderGraph {
  edges: ProviderEdge[] = []
  vertices: ProviderVertex[] = []
}

/**
 * Resolves injection tokens with values
 */
export class Injector {
  private readonly graph: ProviderGraph = new ProviderGraph()

  /**
   * Create an Injector instance
   * @param providers the token-value exchange definitions
   */
  constructor(providers: Provider[]) {
    this.populateGraph(providers)
  }

  /**
   * Gets the value represented by the given token
   * @param token the token to exchange
   */
  resolve<T>(_: InjectionToken<T>): T {
    // TODO
    throw new Error('Not implemented')
  }

  private populateGraph(providers: Provider[]) {
    this.graph.vertices = providers.map(provider => new ProviderVertex(provider))
    this.createEdges()
  }

  private createEdges(): void {
    this.graph.vertices.forEach((vertex, dependentIndex) => {
      const dependencyIndices = this.getDependencyIndices(vertex.provider)
      const edges = dependencyIndices.map(dependencyIndex => new ProviderEdge(dependentIndex, dependencyIndex))
      this.graph.edges.push(...edges)
    })
  }

  private getDependencyIndices(provider: Provider): number[] {
    if (provider instanceof ExplicitProvider && !(provider.value instanceof Function)) {
      return []
    }
    const target = provider instanceof ExplicitProvider ? provider.value : provider
    const tokens: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target) || []
    return tokens.map(token =>
      this.graph.vertices.findIndex(vertex => {
        if (vertex.token instanceof ClassTypeToken && token instanceof ClassTypeToken) {
          return (token?.classType?.name ?? 1) === (vertex.token?.classType?.name ?? 0)
        }
        return token === vertex.token
      }))
  }

}
