import { Inject, Injectable, InjectionContainer, InjectionToken } from '../../src/injection'
import { ElementRegistrar, ElementRegistration } from '../../src/elements'

describe('ElementRegistrar', () => {
  describe('constructor', () => {
    let container: InjectionContainer

    beforeEach(() => {
      container = InjectionContainer.create([])
    })

    it('should throw if CustomElementRegistry does not have define method', () => {
      const registry = {} as CustomElementRegistry

      expect(() => new ElementRegistrar(container, registry))
        .toThrowError('CustomElementRegistry does not have define method.')
    })
  })

  describe('register', () => {
    let registry: jasmine.SpyObj<CustomElementRegistry>
    let container: jasmine.SpyObj<InjectionContainer>
    let registrar: ElementRegistrar

    beforeEach(() => {
      registry = jasmine.createSpyObj<CustomElementRegistry>('CustomElementRegistry', [ 'define' ])
      container = jasmine.createSpyObj<InjectionContainer>('InjectionContainer', [ 'resolve' ])
      registrar = new ElementRegistrar(container, registry)
    })

    it('should throw if element class does not have metadata', () => {
      const element = class CustomElement extends HTMLElement {}
      const registration: ElementRegistration = { element, name: 'custom-el' }

      expect(() => registrar.register(registration))
        .toThrowError(new RegExp(`^Missing injection metadata for ${element.name}`))
    })

    it('should define element with no dependencies', () => {
      @Injectable()
      class CustomElement extends HTMLElement {
        constructor() {
          super()
        }
      }
      const registration = {
        element: CustomElement,
        name: 'custom-el'
      }
      registrar.register(registration)

      const args: any[] = registry.define.calls.mostRecent().args
      expect(args[0]).toBe(registration.name)
      expect(args[1]['__proto__'].name).toBe(registration.element.name)
      expect(args[1]['__proto__'].length).toBe(0)
      expect(args[2]).toBe(undefined)
    })

    it('should define element with dependencies', () => {
      class Dependency {}

      const token = new InjectionToken<Dependency>('testToken')
      const tokenValue = new Dependency()

      container.resolve.and.returnValue(tokenValue)

      @Injectable()
      class CustomElement extends HTMLElement {
        constructor(_dep: Dependency, @Inject(token) _tokenDep: Dependency) {
          super()
        }
      }

      const registration = {
        element: CustomElement,
        name: 'custom-el'
      }

      registrar.register(registration)

      const args: any[] = registry.define.calls.mostRecent().args
      expect(args[0]).toBe(registration.name)
      const proto = args[1]['__proto__'] as Function
      debugger
      expect(proto.length).toBe(2)
      expect(proto.name).toBe(registration.element.name)
    })

    it('should define element with options', () => {
      @Injectable()
      class CustomElement extends HTMLButtonElement {
        constructor() {
          super()
        }
      }
      const registration = {
        element: CustomElement,
        name: 'custom-el',
        options: { extends: 'button' }
      }
      registrar.register(registration)

      const args: any[] = registry.define.calls.mostRecent().args
      expect(args[0]).toBe(registration.name)
      expect(args[1]['__proto__'].name).toBe(registration.element.name)
      expect(args[2]).toBe(registration.options)
    })

    it('should define multiple elements', () => {
      @Injectable() class CustomElement0 extends HTMLElement { constructor() { super() }}
      @Injectable() class CustomElement1 extends HTMLElement { constructor() { super() }}
      @Injectable() class CustomElement2 extends HTMLElement { constructor() { super() }}
      const registrations: ElementRegistration[] = [
        {
          element: CustomElement0,
          name: 'custom-element-0'
        },
        {
          element: CustomElement1,
          name: 'custom-element-1'
        },
        {
          element: CustomElement2,
          name: 'custom-element-2'
        }
      ]

      registrar.register(...registrations)

      const calls = registry.define.calls
      calls.all().forEach((call, i) => {
        const args: any[] = call.args
        expect(args[0]).toBe(`custom-element-${i}`)
        expect(args[1]['__proto__'].name).toBe(`CustomElement${i}`)
      })
    })
  })
})
