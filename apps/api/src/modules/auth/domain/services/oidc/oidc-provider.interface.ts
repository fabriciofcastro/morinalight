export interface OidcUserProfile {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Provider ID
  emailVerified: boolean;
}

export interface OidcProvider {
  /**
   * Generates the authorization URL for the provider
   */
  getAuthUrl(state: string): string;

  /**
   * Exchanges the authorization code for tokens and user profile
   */
  handleCallback(code: string): Promise<OidcUserProfile>;

  /**
   * Provider identifier (e.g. "google", "microsoft")
   */
  name: string;
}
