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
   * Creates an {@link InjectionToken} instance
   * @param description The description of the token
   */
  constructor(description: string) {
    this.description = description || ''
  }
}
