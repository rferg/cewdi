import { ClassType, GenericClassDecorator, paramTypeIsClass } from '../common'
import { parameterInjectionTokensMetadataKey } from './parameter-injection-tokens-metadata-key'
import { InjectionToken } from './injection-token'
import { ClassTypeToken } from './class-type-token'

export const Injectable = (): GenericClassDecorator<ClassType<object>> => {
  return (target: ClassType<object>) => {
    let metadata: InjectionToken[] = Reflect.getMetadata(parameterInjectionTokensMetadataKey, target)
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || []
    if (!metadata) {
      metadata = new Array(paramTypes.length)
    }
    for (let index = 0; index < metadata.length; index++) {
      const token = metadata[index]
      // If injection token already exists for this parameter, then it must
      // have @Inject decorator, since constructor parameter decorators
      // are evaluated before class decorators.
      // see https://www.typescriptlang.org/docs/handbook/decorators.html#decorator-evaluation
      if (token) { continue }
      const paramType = paramTypes[index]
      if (paramTypeIsClass(paramType)) {
        metadata[index] = new ClassTypeToken(paramType, paramType.name)
      }
    }
    Reflect.defineMetadata(parameterInjectionTokensMetadataKey, metadata, target)
  }
}
