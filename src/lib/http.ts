import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://wuyhbxztatoevkfavoon.supabase.co/functions/v1';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiError {
  error: string;
  status?: number;
}

function buildQueryString(query?: QueryParams): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const q = params.toString();
  return q ? `?${q}` : '';
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    query?: QueryParams;
    auth?: boolean; // whether to attach Authorization automatically
  } = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, query, auth = true } = opts;

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;
  const token = auth ? await getToken() : null;

  const init: RequestInit = {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, init);

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err: ApiError = typeof data === 'string' ? { error: data, status: res.status } : { ...(data as ApiError), status: res.status };
    throw err;
  }

  return data as T;
}

export async function saveToken(accessToken: string) {
  try {
    await AsyncStorage.setItem('auth_token', accessToken);
  } catch {
    // ignore
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch {
    // ignore
  }
}