export type Role = 'ADMIN' | 'TEACHER';

export interface LoginRequest {
  username: string;
  password: string;
}

/** POST /api/auth/login response. */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // seconds
  username: string;
  role: string;
}

/** What the frontend keeps after login. The password is never stored. */
export interface Session {
  accessToken: string;
  username: string;
  role: Role;
  expiresAt: number; // epoch ms
}
