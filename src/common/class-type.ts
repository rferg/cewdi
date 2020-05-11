export interface ClassType<T> extends Function {
  // tslint:disable-next-line: no-any
  new (...args: any[]): T
}
