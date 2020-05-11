import { InjectionToken } from './injection-token'
import { ClassType } from '../common'

/**
 * An {@link InjectionToken} where the class type is used to identify
 * what object instance to exchange, namely an instance of the class.
 */
export class ClassTypeToken<T> extends InjectionToken<T> {
  /**
   * The class type to exchange with the instance.
   */
  classType: ClassType<T>

  /**
   * Creates an instance of {@link ClassTypeToken}
   * @param classType The class type that's used to identify the exchange value
   * @param description The description of the token
   */
  constructor(classType: ClassType<T>, description: string) {
    super(description)
    this.classType = classType
  }
}
