import { GoogleOidcProvider } from "./google-oidc.provider";
import type { OidcProvider, OidcUserProfile } from "./oidc-provider.interface";

export class OAuth2Service {
  private providers: Map<string, OidcProvider> = new Map();

  constructor() {
    // Register available providers
    const google = new GoogleOidcProvider();
    this.providers.set(google.name, google);
  }

  getAuthUrl(providerName: string, state: string): string {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not configured`);
    }
    return provider.getAuthUrl(state);
  }

  async handleCallback(providerName: string, code: string): Promise<OidcUserProfile> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not configured`);
    }
    return provider.handleCallback(code);
  }
}
