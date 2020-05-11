import { ClassTypeProvider } from './class-type-provider'
import { ClassProvider } from './class-provider'
import { ValueProvider } from './value-provider'

/**
 * Represents definitions of token exchanges.
 */
// tslint:disable-next-line: no-any
export type Provider = ClassTypeProvider<any> | ClassProvider<any> | ValueProvider<any>
