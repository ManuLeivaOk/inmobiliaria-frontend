export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
  user: User;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
