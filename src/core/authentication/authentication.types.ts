/** Basic information about an authenticated user. */
export interface AuthenticatedUser {
  id: number;
  role: string;
}

/** Checks tokens and identifies users. */
export interface AuthenticationProvider {
  authenticate(token: string): Promise<AuthenticatedUser | null>;
}

/** Key for injecting the authentication provider. */
export const AUTHENTICATION_PROVIDER = Symbol('AUTHENTICATION_PROVIDER');

/** Creates access tokens for users. */
export interface TokenIssuer {
  issueAccessToken(user: AuthenticatedUser): Promise<string>;
}

/** Key for injecting the token issuer. */
export const TOKEN_ISSUER = Symbol('TOKEN_ISSUER');

/** Identifies a validated access token. */
export interface AuthenticatedToken {
  user: AuthenticatedUser;
  jti: string;
  expiresAt: number;
}

/** Validates a token and returns its identity and expiration. */
export interface TokenInspector {
  inspectToken(token: string): Promise<AuthenticatedToken | null>;
}

/** Key for injecting the token inspector. */
export const TOKEN_INSPECTOR = Symbol('TOKEN_INSPECTOR');

// ---------------------------REFRESH_TOKEN--------------------------

/** Represents a newly issued refresh token. */
export interface IssuedRefreshToken {
  token: string;
  jti: string;
  expiresAt: number;
}

/** Creates refresh tokens for authenticated users. */
export interface RefreshTokenIssuer {
  issueRefreshToken(
    user: AuthenticatedUser,
    sessionId: string,
  ): Promise<IssuedRefreshToken>;
}

/** Represents a validated refresh token. */
export interface AuthenticatedRefreshToken {
  user: AuthenticatedUser;
  jti: string;
  sessionId: string;
  expiresAt: number;
}

/** Validates refresh tokens and extracts their identity. */
export interface RefreshTokenInspector {
  inspectRefreshToken(token: string): Promise<AuthenticatedRefreshToken | null>;
}

/** Represents the data stored for a refresh token session. */
export interface RefreshTokenSession {
  userId: number;
  currentJti: string;
  expiresAt: number;
}

/** Injection token for the refresh token issuer. */
export const REFRESH_TOKEN_ISSUER = Symbol('REFRESH_TOKEN_ISSUER');

/** Injection token for the refresh token inspector. */
export const REFRESH_TOKEN_INSPECTOR = Symbol('REFRESH_TOKEN_INSPECTOR');
