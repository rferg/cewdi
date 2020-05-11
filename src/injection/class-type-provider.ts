import { ClassType } from '../common'

/**
 * Interface for defining token exchange where
 * the class itself is used as the token and an instance of the class
 * is the value
 */
export interface ClassTypeProvider<T> extends ClassType<T> {}
