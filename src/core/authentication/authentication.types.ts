
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
export const AUTHENTICATION_PROVIDER = Symbol(
  'AUTHENTICATION_PROVIDER',
);

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
