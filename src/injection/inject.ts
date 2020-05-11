import { InjectionToken } from './injection-token'
import { PARAMETER_INJECTION_TOKENS_METADATA } from './parameter-injection-tokens-metadata'

/**
 * A parameter decorator used to define an injection token
 * to be exchanged for a value in a class constructor.
 *
 * ```ts
 * class MyClass {
 *  constructor(@Inject(token) dependency: OtherClass) { }
 * }
 * ```
 * @param token the {@link InjectionToken} to exchange with a value
 */
export const Inject = (token: InjectionToken): ParameterDecorator => {
  return (target: Object, _: string | symbol, parameterIndex: number) => {
    if (!Reflect.hasOwnMetadata(PARAMETER_INJECTION_TOKENS_METADATA, target)) {
      Reflect.defineMetadata(PARAMETER_INJECTION_TOKENS_METADATA, {}, target)
    }
    const metadata = Reflect.getOwnMetadata(PARAMETER_INJECTION_TOKENS_METADATA, target)
    metadata[parameterIndex] = token
  }
}
