/**
 * Checks if reflected param type is a class
 * @param type the param type returned from Reflect.getMetadata('design:paramtypes', target)
 */
export function paramTypeIsClass(type: Function): boolean {
  return type instanceof Function
    && [ 'Number', 'String', 'Boolean', 'Object' ].indexOf(type.name) === -1
}
