import { InjectionToken } from './injection-token'
import { parameterInjectionTokensMetadataKey } from './parameter-injection-tokens-metadata-key'

/**
 * Returns a parameter decorator used to define an injection token
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
    let metadata: InjectionToken[] = Reflect.getOwnMetadata(parameterInjectionTokensMetadataKey, target)
    if (!metadata) {
      metadata = new Array((target as Function).length)
    }
    metadata[parameterIndex] = token
    Reflect.defineMetadata(parameterInjectionTokensMetadataKey, metadata, target)
  }
}
