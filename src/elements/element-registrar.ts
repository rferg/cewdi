import { InjectionContainer, InjectionToken, parameterInjectionTokensMetadataKey } from '../injection'
import { ElementRegistration } from './element-registration'

/**
 * Responsible for defining custom elements
 * while resolving their dependencies with given
 * {@link InjectionContainer}
 */
export class ElementRegistrar {
  private readonly injectionContainer: InjectionContainer
  private readonly registry: CustomElementRegistry

  /**
   * Create an ElementRegistry instance.
   * @param injectionContainer the dependency injection container
   * responsible for resolving custom elements' dependencies. Defaults
   * to an empty InjectionContainer.
   * @param customElementRegistry the registry to define custom elements in.
   * Defaults to window.customElements.
   */
  constructor(
    injectionContainer?: InjectionContainer,
    customElementRegistry?: CustomElementRegistry) {
    this.registry = customElementRegistry || (window && window.customElements)
    this.injectionContainer = injectionContainer || InjectionContainer.create([])

    if (!this.registry) {
      throw new Error(`Missing CustomElementRegistry. If not running in the browser` +
        ` pass an object that implements CustomElementRegistry to the ElementRegistry constructor.` +
        ` If running in the browser custom elements may not be supported and a polyfill is required.`)
    }

    if (!this.registry.define) {
      throw new Error(`CustomElementRegistry does not have define method.`)
    }
  }

  /**
   * Define custom elements in the CustomElementRegistry
   * @param elementRegistrations the registration information for the custom elements
   */
  register(...elementRegistrations: ElementRegistration[]): void {
    (elementRegistrations || [])
      .filter(registration => !!registration)
      .forEach(({ element, name, options }) => {
        const tokens: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, element)
        if (!tokens) {
          throw new Error(`Missing injection metadata for ${element.name}. ` +
            `Did you forget to add @Injectable to this class?`)
        }
        const resolvedDependencies = tokens.map(token => this.injectionContainer.resolve(token))
        this.registry.define(
          name,
          class extends element { constructor() { super(...resolvedDependencies) }},
          options)
      })
  }
}
