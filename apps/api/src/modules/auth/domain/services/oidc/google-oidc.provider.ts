import type { OidcProvider, OidcUserProfile } from "./oidc-provider.interface";

export class GoogleOidcProvider implements OidcProvider {
  readonly name = "google";
  private readonly clientId = process.env.GOOGLE_CLIENT_ID || "";
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  private readonly redirectUri = `${process.env.API_URL}/auth/google/callback`;

  getAuthUrl(state: string): string {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      state: state,
    };
    const qs = new URLSearchParams(options).toString();
    return `${rootUrl}?${qs}`;
  }

  async handleCallback(code: string): Promise<OidcUserProfile> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OIDC credentials not configured");
    }

    // 1. Exchange code for tokens
    const tokenParams = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: "authorization_code",
    };

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });

    if (!tokenRes.ok) {
      throw new Error(`Google OIDC Token Error: ${tokenRes.statusText}`);
    }

    const { id_token, access_token } = await tokenRes.json();

    // 2. Get User Info
    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: { Authorization: `Bearer ${id_token}` },
      },
    );

    if (!userRes.ok) {
      throw new Error(`Google OIDC User Info Error: ${userRes.statusText}`);
    }

    const profile = await userRes.json();

    return {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      sub: profile.id,
      emailVerified: profile.verified_email,
    };
  }
}
