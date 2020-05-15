/**
 * Represents a token to be exchanged with a value when injected.
 */
// tslint:disable-next-line:no-any
export class InjectionToken<_ = any> {
  /**
   * The description of the token
   */
  description: string
  /**
   * Gets the (probably) unique ID for the injection token
   */
  get id(): string {
    return this._id
  }
  private readonly _id: string

  /**
   * Creates an {@link InjectionToken} instance
   * @param description The description of the token
   */
  constructor(description: string) {
    this.description = description || ''
    this._id = '_' + Math.random().toString(36).substr(2, 9)
  }
}
