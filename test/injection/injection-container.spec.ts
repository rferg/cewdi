import { InjectionContainer, InjectionToken, Injector } from '../../src/injection'

class TestContainer extends InjectionContainer {
  constructor(injector: Injector) {
    super(injector)
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
      injector = jasmine.createSpyObj('Injector', [ 'resolve' ])
      container = new TestContainer(injector)
    })

    it('should call injector.resolve with injection token', () => {
      const token = new InjectionToken('token')

      container.resolve(token)

      expect(injector.resolve).toHaveBeenCalledWith(token)
    })
  })
})
