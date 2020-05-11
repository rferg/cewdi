/**
 * Options for lifetimes of value instances.
 */
export enum Lifetime {
  /**
   * A single value instance will exist for
   * the lifetime of the injector.
   */
  Singleton = 'Singleton',
  /**
   * A new value instance will be created
   * for each injection request.
   */
  Transient = 'Transient'
}
