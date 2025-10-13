export interface AuthState {
  signup: { loading: boolean; error: string | null; user: any | null };
  login: { loading: boolean; error: string | null; user: any | null };
}