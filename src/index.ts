import 'reflect-metadata'

if (!Reflect || !Reflect.getMetadata) {
  throw new Error(`No reflection polyfill found.  Please add "import 'reflect-metadata'".`)
}

export { ElementRegistration, ElementRegistrar as ElementRegistry } from '../src/elements'
export {
  ClassTypeProvider,
  ExplicitProvider,
  Inject,
  Injectable,
  InjectionContainer,
  InjectionToken,
  Lifetime,
  Provider
} from '../src/injection'
