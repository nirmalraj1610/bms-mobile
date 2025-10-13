import { authSignup, authLogin } from '../../lib/api';

export async function signup(payload: { email: string; password: string; full_name: string; phone?: string; user_type: 'client' | 'photographer' | 'studio_owner' }) {
  return authSignup(payload);
}

export async function login(payload: { email: string; password: string }) {
  return authLogin(payload);
}