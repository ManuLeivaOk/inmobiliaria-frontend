import type { AuthResponse, User } from '@/lib/auth/types';
import { apiRequest } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'ADMIN' | 'VENDEDOR';
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function register(payload: RegisterPayload, accessToken?: string | null) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
    accessToken: accessToken ?? null,
  });
}

export function refreshSession() {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
  });
}

/** Quita la cookie refresh inválida (público, sin Bearer). */
export function clearSession() {
  return apiRequest<void>('/auth/clear-session', {
    method: 'POST',
    skipAuth: true,
  });
}

export function logout() {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function logoutAll() {
  return apiRequest<void>('/auth/logout-all', { method: 'POST' });
}

export function getMe(accessToken?: string | null) {
  return apiRequest<User>('/auth/me', {
    accessToken: accessToken ?? undefined,
  });
}

export function adminPing() {
  return apiRequest<{ ok: boolean; scope: string }>('/auth/admin/ping');
}
