import {
  ClassTypeToken,
  ExplicitProvider,
  Inject,
  Injectable,
  InjectionContainer,
  InjectionToken,
  Lifetime,
  Provider
} from '../../src/injection'
import { ElementRegistrar, ElementRegistration } from '../../src/elements'

interface InjectedValueObject {
  value: string
}
const testAttribute = 'test'

const injectedValueObjectToken = new InjectionToken<InjectedValueObject>('injectedValueObject')

@Injectable()
class RootService {
  private readonly rootString = 'rootString'
  constructor() {}

  getRootString(): string {
    return this.rootString
  }
}

@Injectable()
class Counter {
  readonly counter: number = 0
  constructor() {
    this.counter++
  }
}

@Injectable()
class RootDependentService {
  constructor(private readonly root: RootService) {}

  getRootString(): string {
    return this.root.getRootString()
  }
}

@Injectable()
class RootIndependentService {
  constructor(private readonly counter: Counter) {}

  getCounter(): number {
    return this.counter.counter
  }
}

@Injectable()
class OtherRootDependentService {
  constructor(_: RootService, @Inject(injectedValueObjectToken) private readonly injected: InjectedValueObject) {}

  getInjectedValue(): string {
    return this.injected.value
  }
}

@Injectable()
class OtherOtherRootDependentService {
  constructor(private readonly rootService: RootService) {}

  getRootString(): string {
    return this.rootService.getRootString()
  }
}

@Injectable()
class OtherRootDependentDependentService {
  constructor(private readonly dep: OtherRootDependentService) {}

  getInjectedValue(): string {
    return this.dep.getInjectedValue()
  }
}

@Injectable()
class RootElement extends HTMLElement {
  constructor(private readonly rootDep: RootDependentService) {
    super()
  }

  connectedCallback() {
    this.setAttribute(testAttribute, this.rootDep.getRootString())
  }
}

@Injectable()
class OtherElement extends HTMLElement {

  constructor(private readonly otherRootDep: OtherRootDependentService) {
    super()
  }

  connectedCallback() {
    this.setAttribute(testAttribute, this.otherRootDep.getInjectedValue())
  }
}

@Injectable()
class OtherOtherElement extends HTMLElement {
  constructor(private readonly otherOtherRootDependent: OtherOtherRootDependentService) {
    super()
  }

  connectedCallback() {
    this.setAttribute(testAttribute, this.otherOtherRootDependent.getRootString())
  }
}

@Injectable()
class GrandchildElement extends HTMLElement {

  constructor(private readonly otherRootDepDep: OtherRootDependentDependentService) {
    super()
  }

  connectedCallback() {
    this.setAttribute(testAttribute, this.otherRootDepDep.getInjectedValue())
  }
}

describe('Integration:Simple', () => {

  describe('One Container', () => {
    let container: InjectionContainer
    const injectedValueObjectProvider = new ExplicitProvider(injectedValueObjectToken, { value: 'INJECTED_VALUE' })

    const providers: Provider[] = [
      OtherRootDependentService,
      RootService,
      RootDependentService,
      injectedValueObjectProvider,
      new ExplicitProvider(
        new ClassTypeToken(Counter),
        Counter,
        { lifetime: Lifetime.Transient }),
      new ExplicitProvider(
          new ClassTypeToken(RootIndependentService),
          RootIndependentService,
          { lifetime: Lifetime.Transient })
    ]
    const elementRegistrations: ElementRegistration[] = [
      {
        element: RootElement,
        name: 'root-element-0'
      },
      {
        element: OtherElement,
        name: 'other-element-0'
      }
    ]

    beforeAll(() => {
      container = InjectionContainer.create(providers)
      const registrar = new ElementRegistrar(container)
      registrar.register(...elementRegistrations)
    })

    it('should create elements with injected values', () => {
      const rootEl = document.createElement('root-element-0')
      const otherEl = document.createElement('other-element-0')
      document.body.appendChild(rootEl)
      document.body.appendChild(otherEl)

      const rootService = container.resolve<RootService>(new ClassTypeToken(RootService))
      const rootString = rootService.getRootString()

      expect(rootEl.getAttribute(testAttribute)).toBe(rootString)
      expect(otherEl.getAttribute(testAttribute)).toBe((injectedValueObjectProvider.value as InjectedValueObject).value)
    })

    it('should provide new instance each time for Transient dependency', () => {
      const getService = () => container.resolve<RootIndependentService>(new ClassTypeToken(RootIndependentService))
      const service = getService()
      const count = service.getCounter()

      expect(getService().getCounter()).toEqual(count)
      expect(getService().getCounter()).toEqual(count)
    })
  })

  describe('Multi Container', () => {
    describe('Vertical', () => {
      let childContainer: InjectionContainer
      let rootContainer: InjectionContainer
      const injectedValueObjectProvider = new ExplicitProvider(injectedValueObjectToken, { value: 'INJECTED_VALUE' })

      beforeAll(() => {
        const rootProviders: Provider[] = [
          RootService,
          RootDependentService
        ]
        rootContainer = InjectionContainer.create(rootProviders)
        const childProviders: Provider[] = [
          OtherRootDependentService,
          injectedValueObjectProvider
        ]
        childContainer = rootContainer.createChildContainer(childProviders)

      })

      it('should define root element', () => {
        const rootRegistrations: ElementRegistration[] = [
          {
            element: RootElement,
            name: 'root-element-multi-vertical'
          }
        ]
        const rootRegistrar = new ElementRegistrar(rootContainer)
        rootRegistrar.register(...rootRegistrations)
        const rootEl = document.createElement('root-element-multi-vertical')
        document.body.appendChild(rootEl)

        const rootService = rootContainer.resolve<RootService>(new ClassTypeToken(RootService))
        const rootString = rootService.getRootString()

        expect(rootEl.getAttribute(testAttribute)).toBe(rootString)
      })

      it('should define child element via child container', () => {
        const childRegistrar = new ElementRegistrar(childContainer)
        childRegistrar.register({ element: OtherElement, name: 'child-element-multi-vertical' })

        const otherEl = document.createElement('child-element-multi-vertical')
        document.body.appendChild(otherEl)

        expect(otherEl.getAttribute(testAttribute))
          .toBe((injectedValueObjectProvider.value as InjectedValueObject).value)
      })

      it('should define grandchild element via grandchild container', () => {
        const grandchildProviders: Provider[] = [ OtherRootDependentDependentService ]
        const grandchildContainer = childContainer.createChildContainer(grandchildProviders)
        const grandchildRegistrar = new ElementRegistrar(grandchildContainer)
        grandchildRegistrar.register({ element: GrandchildElement, name: 'grandchild-element-multi-vertical' })

        const grandchildEl = document.createElement('grandchild-element-multi-vertical')
        document.body.appendChild(grandchildEl)
        const service = grandchildContainer.resolve<OtherRootDependentDependentService>(
          new ClassTypeToken(OtherRootDependentDependentService))

        expect(grandchildEl.getAttribute(testAttribute)).toBe(service.getInjectedValue())
      })
    })

    describe('Branched', () => {
      let rootContainer: InjectionContainer
      const injectedValueObjectProvider = new ExplicitProvider(injectedValueObjectToken, { value: 'INJECTED_VALUE' })

      beforeAll(() => {
        const rootProviders: Provider[] = [
          RootService,
          RootDependentService
        ]
        rootContainer = InjectionContainer.create(rootProviders)
      })

      it('should resolve dependencies and create root element and elements from two child branches', () => {
        const firstBranchProviders: Provider[] = [
          OtherRootDependentService,
          injectedValueObjectProvider
        ]
        const firstBranchContainer = rootContainer.createChildContainer(firstBranchProviders)

        const secondBranchProviders: Provider[] = [
          OtherOtherRootDependentService
        ]
        const secondBranchContainer = rootContainer.createChildContainer(secondBranchProviders)

        const firstBranchRegistrar = new ElementRegistrar(firstBranchContainer)
        const secondBranchRegistrar = new ElementRegistrar(secondBranchContainer)

        firstBranchRegistrar.register(
          {
            element: RootElement,
            name: 'root-element-first-branch'
          },
          {
            element: OtherElement,
            name: 'other-element-first-branch'
          }
        )

        secondBranchRegistrar.register({ element: OtherOtherElement, name: 'other-other-element-second-branch' })

        const rootEl = document.createElement('root-element-first-branch')
        const otherEl = document.createElement('other-element-first-branch')
        const otherOtherEl = document.createElement('other-other-element-second-branch')
        document.body.appendChild(rootEl)
        document.body.appendChild(otherEl)
        document.body.appendChild(otherOtherEl)

        // RootService should be resolvable by child branch
        const rootService = secondBranchContainer.resolve<RootService>(new ClassTypeToken(RootService))
        const rootString = rootService.getRootString()

        expect(rootEl.getAttribute(testAttribute)).toBe(rootString)
        expect(otherEl.getAttribute(testAttribute))
          .toBe((injectedValueObjectProvider.value as InjectedValueObject).value)
        expect(otherOtherEl.getAttribute(testAttribute)).toBe(rootString)
      })
    })
  })

})
