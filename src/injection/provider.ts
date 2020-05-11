import { ClassTypeProvider } from './class-type-provider'
import { ExplicitProvider } from './explicit-provider'

/**
 * Represents definition of a token exchanges.
 */
// tslint:disable-next-line: no-any
export type Provider = ClassTypeProvider<any> | ExplicitProvider<any>
