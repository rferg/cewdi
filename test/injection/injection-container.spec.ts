import { ExplicitProvider, InjectionContainer, InjectionToken, Injector, Provider } from '../../src/injection'
import { ProviderVertex } from '../../src/injection/provider-vertex'

class TestContainer extends InjectionContainer {
  constructor(providers: Provider[], injectorFactory: (providers: Provider[]) => Injector) {
    super(providers, injectorFactory)
  }
}

describe('InjectionContainer', () => {
  describe('create', () => {
    it('should return InjectionContainer instance', () => {
      const container = InjectionContainer.create([])

      expect(container).toBeInstanceOf(InjectionContainer)
    })
  })

  describe('resolve', () => {
    let container: InjectionContainer
    let injector: jasmine.SpyObj<Injector>

    beforeEach(() => {
      injector = jasmine.createSpyObj('Injector', [ 'resolve', 'addVertices' ])
      container = new TestContainer([], _ => injector)
    })

    it('should call injector.resolve with injection token', () => {
      const token = new InjectionToken('token')

      container.resolve(token)

      expect(injector.resolve).toHaveBeenCalledWith(token)
    })
  })

  describe('createChildContainer', () => {

    it('should call injectorFactory with new child providers and add parent vertices', () => {
      const injectorFactory = jasmine.createSpy('InjectorFactory')
      const parentProviders: Provider[] = [ class TestClass {} ]
      const parentVertices = parentProviders.map(p => new ProviderVertex(p))
      const injector = jasmine.createSpyObj('Injector', [ 'resolve', 'addVertices' ], {
        vertices: parentVertices
      })
      injectorFactory.and.returnValue(injector)
      const container = new TestContainer(parentProviders, injectorFactory)

      const childInjector = jasmine.createSpyObj('ChildInjector', [ 'resolve', 'addVertices' ])
      injectorFactory.and.returnValue(childInjector)
      const childProviders: Provider[] = [ new ExplicitProvider(new InjectionToken('test'), 123) ]

      const childContainer = container.createChildContainer(childProviders)

      expect(childContainer).toBeInstanceOf(InjectionContainer)
      expect(injectorFactory).toHaveBeenCalledWith(childProviders)
      expect(childInjector.addVertices).toHaveBeenCalledWith(parentVertices)
    })
  })
})
