import { Provider } from './provider'
import { InjectionToken } from './injection-token'
import { ExplicitProvider } from './explicit-provider'
import { parameterInjectionTokensMetadataKey } from './parameter-injection-tokens-metadata-key'
import { ClassType } from '../common'
import { Lifetime } from './lifetime'
import { ClassTypeProvider } from './class-type-provider'
import { ProviderVertex } from './provider-vertex'

class ProviderGraph {
  /**
   * Edges will be represented as hashmap of adjacency lists,
   * where edges[vertex.token.id] is an array of the vertex's dependency token.ids
   */
  edges: { [tokenId: string]: string[] } = {}
  vertices: ProviderVertex[] = []
}

/**
 * Resolves injection tokens with values
 */
export class Injector {
  private readonly graph: ProviderGraph = new ProviderGraph()
  private readonly topSortCache: Map<string, string[]> = new Map<string, string[]>()

  /**
   * Gets the provider vertices from this Injector's graph
   */
  get vertices(): ProviderVertex[] {
    return this.graph.vertices || []
  }

  /**
   * Create an Injector instance
   * @param providers the token-value exchange definitions
   */
  constructor(providers: Provider[]) {
    this.addVertices((providers || []).map(provider => new ProviderVertex(provider)))
  }

  /**
   * Add providers from existing Injector's graph
   * @param vertices the provider vertices to add
   */
  addVertices(vertices: ProviderVertex[]): void {
    if (!this.graph.vertices) { this.graph.vertices = [] }
    if (!this.graph.edges) { this.graph.edges = {} }
    (vertices || []).forEach(newVertex => {
      const existing = this.graph.vertices.find(vertex => vertex.token.id === newVertex.token.id)
      if (!existing) {
        this.graph.vertices.push(newVertex)
        this.graph.edges[newVertex.token.id] = this.getDependencyTokenIds(newVertex.provider)
      }
    })
  }

  /**
   * Gets the value represented by the given token
   * @param token the token to exchange
   */
  resolve<T>(token: InjectionToken<T>): T {
    if (!token) { throw Error(`Injector resolve method received ${token} as token.`) }
    if (this.topSortCache.has(token.id)) {
      return this.resolveTopologicallySortedPath<T>(this.topSortCache.get(token.id) || [])
    }

    const adjacentIds = this.graph.edges[token.id]
    if (!adjacentIds) { throw new Error(`Injector does not have provider for ${token.description}.`) }

    const visited: {[tokenId: string]: boolean} = {}
    this.graph.vertices.forEach(vertex => visited[vertex.token.id] = false)

    const sorted: string[] = []
    let currentSortedIndex = 0

    for (const currentId of adjacentIds) {
      if (!visited[currentId]) {
        currentSortedIndex = this.depthFirstSearch(currentSortedIndex, currentId, visited, sorted)
      }
    }
    sorted.push(token.id)
    this.topSortCache.set(token.id, sorted)
    return this.resolveTopologicallySortedPath(sorted)
  }

  private depthFirstSearch(
    currentSortedIndex: number,
    currentId: string,
    visited: {[tokenId: string]: boolean},
    sorted: string[]): number {

    visited[currentId] = true

    const adjacentIds = this.graph.edges[currentId]
    if (!adjacentIds) { throw new Error(`Injector does not have provider for ${currentId}.`) }

    for (const nextId of adjacentIds) {
      if (!visited[nextId]) {
        currentSortedIndex = this.depthFirstSearch(currentSortedIndex, nextId, visited, sorted)
      }
    }
    sorted[currentSortedIndex] = currentId
    return currentSortedIndex + 1
  }

  private getDependencyTokenIds(provider: Provider): string[] {
    if (this.isNonFunctionProvider(provider)) {
      return []
    }
    const target = provider instanceof ExplicitProvider ? provider.value : provider
    const tokens: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target)
    if (!tokens) {
      throw new Error(`Missing injection metadata for ${(provider as ClassTypeProvider<any>).name}. ` +
        `Did you forget to add @Injectable to this class?`)
    }
    return tokens.map(token => token.id)
  }

  private resolveTopologicallySortedPath<T>(path: string[]): T {
    const resolved: { [tokenId: string]: ProviderVertex } = {}

    path.forEach(tokenId => {
      const vertex = this.graph.vertices.find(v => v.token.id === tokenId)
      if (!vertex) { throw new Error(`Missing vertex for token ${tokenId}.`) }

      if (this.isNonFunctionProvider(vertex.provider)) {
        if (!vertex.instance) {
          vertex.instance = (vertex.provider as ExplicitProvider<any>).value
        }
      } else if (this.functionVertexNeedsNewInstance(vertex)) {
        const dependencyTokenIds = this.graph.edges[tokenId] || []
        const dependencies = dependencyTokenIds.map(dependencyTokenId => {
          const resolvedDependency = resolved[dependencyTokenId]
          if (!resolvedDependency) {
            throw new Error(`Nothing was resolved for token ${dependencyTokenId}, ` +
              `which is a dependency of ${vertex.token.description}.`)
          }
          return resolvedDependency
        })

        this.throwIfSingletonWithTransientDependency(vertex, dependencies)

        vertex.instance = this.getInstance(vertex.provider, dependencies.map(dep => dep.instance))
      }
      resolved[tokenId] = vertex
    })
    return resolved[path[path.length - 1]].instance as T
  }

  private isNonFunctionProvider(provider: Provider): boolean {
    return provider instanceof ExplicitProvider && !(provider.value instanceof Function)
  }

  private functionVertexNeedsNewInstance(vertex: ProviderVertex): boolean {
    return !vertex.instance || vertex.lifetime === Lifetime.Transient
  }

  private getInstance(provider: Provider, dependencyInstances: any[]): any {
    const classType: ClassType<object> = provider instanceof ExplicitProvider ? provider.value : provider
    return new classType(...dependencyInstances)
  }

  private throwIfSingletonWithTransientDependency(dependent: ProviderVertex, dependencies: ProviderVertex[]): void {
    if (dependent.lifetime === Lifetime.Singleton) {
      const transientDependencies = dependencies.filter(dep => dep.lifetime === Lifetime.Transient)
      if (transientDependencies.length) {
        throw new Error(`${dependent.token.description} has a Singleton lifetime, `
          + `but its dependencies: [${transientDependencies.map(dep => dep.token.description).join(', ')}]`
          + ` have Transient lifetimes.  This can cause unexpected behavior and should be avoided.`)
      }
    }
  }

}
