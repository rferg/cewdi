# cewdi

![CI](https://github.com/rferg/cewdi/workflows/CI/badge.svg)

Custom Elements with Dependency Injection

cewdi enables [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to be used with constructor injection.

## Installation

Install using `npm` with: `npm i cewdi`

cewdi relies on TypeScript [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and the [Metadata Reflection API](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata).

Ensure that your `tsconfig.json` has `experimentalDecorators` and `emitDecoratorMetadata` set to `true` and that you import a Reflection API polyfill (e.g., [reflect-metadata](https://github.com/rbuckton/reflect-metadata) or [@abraham/reflection](https://github.com/abraham/reflection)) before running any injection-dependent code.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```typescript
// index.ts
import 'reflect-metadata'
```

## Basic usage

```typescript
import {
  ElementRegistrar,
  ElementRegistration,
  ExplicitProvider,
  Inject,
  Injectable,
  InjectionContainer,
  InjectionToken,
  Provider
} from 'cewdi'

// Class dependencies must have the @Injectable decorator.
@Injectable()
class GreetingValidationService {
  isValid(greeting: string): boolean { ... }
}

// Non-class dependencies can be exchanged for an InjectionToken<T>, where T is the dependency type.
const greetingPrefixToken = new InjectionToken<string>('Greeting Prefix')

@Injectable()
class GreetingService {

  constructor(
    private readonly validator: GreetingValidationService,
    // Use the @Inject parameter decorator and an injection token to inject a non-class dependency.
    @Inject(greetingPrefixToken) private readonly greetingPrefix: string
  ) {}

  getGreeting(name: string): string {
    const greeting = `${this.greetingPrefix}, ${name}!`
    if (!this.validator.isValid(greeting)) {
      throw new Error(`Greeting "${greeting}" is invalid!`)
    }
    return greeting
  }
}

// Custom Elements require the @Injectable decorator as well.
@Injectable()
class GreetingElement extends HTMLElement {

  // Class or non-class dependencies can be injected into a custom element's
  // constructor just like any other class.
  constructor(private readonly greetingService: GreetingService) {
    super()
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const paragraph = document.createElement('p')
    paragraph.innerText = this.greetingService.getGreeting('cewdi')
    shadow.appendChild(paragraph)
  }
}

// Any dependencies that will be injected need to have a provider.
const providers: Provider[] = [
  GreetingValidationService,
  GreetingService,
  new ExplicitProvider(greetingPrefixToken, 'Hello')
]
// ElementRegistrations specify the custom elements to define.
const elements: ElementRegistration[] = [
  {
    name: 'app-greeting',
    element: GreetingElement
  }
]
// Create the InjectionContainer by passing in Providers.
const container = InjectionContainer.create(providers)
// Create the ElementRegistrar, which will use the given InjectionContainer to resolve dependencies for Custom Elements.
const registrar = new ElementRegistrar(container)
// Register the Custom Elements with the CustomElementRegistry.
registrar.register(...elements)
```

## Child containers

You can create child `InjectionContainer`s from a parent, which will provide access to any `Provider`s from the parent, as well as those used to create the child.

This is useful when you want to lazy-load Custom Elements and their dependencies.

```typescript
// load-sub-module.ts
import { InjectionContainer } from 'cewdi'

export async function loadSubModule(parentContainer: InjectionContainer, path: string): Promise<InjectionContainer> {
  const { providers, elements }: { providers: Provider[], elements: ElementRegistration[] } = await import(path)
  const childContainer = parentContainer.createChildContainer(providers)
  const registrar = new ElementRegistrar(childContainer)
  registrar.register(...elements)
  return childContainer
}
```

## Provider lifetime

`Provider`s can have one of two lifetime options, which specify how injected dependency values will be created:

- __Singleton__: The same instance will be used for the lifetime of the injection container.  This is the default.
- __Transient__: A new instance will be used each time the dependency is resolved.

You can specify the lifetime of a provider by passing it in the `options` parameter of the `ExplicitProvider` constructor.

```typescript
new ExplicitProvider(
  new ClassTypeToken(CounterService),
  CounterService,
  { lifetime: Lifetime.Transient })
```

Note that cewdi will throw an error if the value of a `Singleton` provider depends on the value of a `Transient` provider.
