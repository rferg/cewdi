import { ClassType } from '../common'
import { ClassTypeToken } from '../injection'

/**
 * Interface for defining token exchange with class that will be instantiated.
 */
export interface ClassProvider<T> {
  /**
   * The token to exchange.
   */
  provide: ClassTypeToken<T>
  /**
   * The class whose instance will be exchanged.
   */
  useClass: ClassType<T>
}
