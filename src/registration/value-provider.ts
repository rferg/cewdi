import { InjectionToken } from '../injection'

/**
 * Interface for defining token exchange with a value.
 */
export interface ValueProvider<T> {
  /**
   * The token to exchange.
   */
  provide: InjectionToken<T>
  /**
   * The value to exchange.
   */
  useValue: T
}
