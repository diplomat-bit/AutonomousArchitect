export interface IntuitConfig {
  clientId: string;
  hasClientSecret: boolean;
  redirectUri: string;
  environment: string;
  activeTokens: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    realmId: string | null;
    expiresIn: number | null;
    updatedAt: number | null;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  x_refresh_token_expires_in?: number;
  id_token?: string;
  decodedIdToken?: Record<string, any> | null;
  realmId?: string | null;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
}

export type SupportedLanguage = 
  | 'nodejs-express'
  | 'python-fastapi'
  | 'python-flask'
  | 'dotnet-csharp'
  | 'java-spring'
  | 'go'
  | 'php'
  | 'curl';

export interface CodeTemplate {
  id: SupportedLanguage;
  name: string;
  category: string;
  icon: string;
  description: string;
  files: {
    filename: string;
    language: string;
    code: string;
  }[];
  runInstructions: string[];
}
