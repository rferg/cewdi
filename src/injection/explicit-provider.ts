import { ClassType } from '../common'
import { Lifetime } from './lifetime'
import { InjectionToken } from './injection-token'

/**
 * Defines a token-to-value exchange.
 */
export class ExplicitProvider<T> {
  /**
   * The token to exchange.
   */
  token: InjectionToken<T>
  /**
   * The value or instance of a class to provide in exchange for the token.
   */
  value: T | ClassType<T>
  /**
   * The lifetime of the value instance.
   */
  lifetime: Lifetime = Lifetime.Singleton

  /**
   * Create an ExplicitProvider instance
   * @param token The token to exchange for the value.  Required.
   * @param value The value or instance of a class to provide in exchange for the token
   * @param options Options for provider creation
   */
  constructor(token: InjectionToken<T>, value: T | ClassType<T>, options?: { lifetime?: Lifetime }) {
    if (!token) {
      throw new Error(`ExplicitProvider token was not provided for value: ${value}`)
    }
    this.token = token
    this.value = value
    if (options) {
      this.lifetime = options.lifetime || Lifetime.Singleton
    }
  }
}
