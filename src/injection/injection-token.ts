/**
 * Represents a token to be exchanged with a value when injected.
 */
export class InjectionToken<_> {
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
