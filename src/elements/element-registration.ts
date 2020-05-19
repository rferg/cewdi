import { ClassType } from '../common'

export interface ElementRegistration {
  element: ClassType<HTMLElement>,
  name: string,
  options?: ElementDefinitionOptions
}
