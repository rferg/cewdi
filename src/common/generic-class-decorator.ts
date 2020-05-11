import 'reflect-metadata'

/**
 * Defines type for a metadata decorator for classes.
 */
export type GenericClassDecorator<T> = (target: T) => void
